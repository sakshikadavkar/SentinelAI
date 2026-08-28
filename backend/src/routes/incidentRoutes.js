const express = require("express");
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/authMiddleware");
const {
  extractIOCsFromIncident,
} = require("../services/iocService");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE INCIDENT
|--------------------------------------------------------------------------
| POST /api/incidents
|
| Creates an incident and automatically extracts IOCs from:
| - title
| - description
| - source
| - affected system
| - manually entered indicators
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      source,
      category,
      affectedSystem,
      indicators,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Build temporary incident object
    |--------------------------------------------------------------------------
    */

    const incidentData = {
      title: title.trim(),
      description: description.trim(),
      severity: severity || "medium",
      source: source || "manual",
      category: category || "other",
      affectedSystem: affectedSystem
        ? affectedSystem.trim()
        : "",
      indicators: Array.isArray(indicators)
        ? indicators
        : [],
    };

    /*
    |--------------------------------------------------------------------------
    | AUTOMATIC IOC EXTRACTION
    |--------------------------------------------------------------------------
    */

    const extractedIOCs =
      extractIOCsFromIncident(incidentData);

    console.log("🔎 IOC Extraction Result:");
    console.log(extractedIOCs);

    /*
    |--------------------------------------------------------------------------
    | Convert extracted IOCs into indicator values
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | [
    |   {
    |     type: "ipv4",
    |     value: "185.220.101.42"
    |   }
    | ]
    |
    | becomes:
    |
    | ["185.220.101.42"]
    |
    |--------------------------------------------------------------------------
    */

    const automaticIndicators =
      extractedIOCs.map((ioc) => ioc.value);

    /*
    |--------------------------------------------------------------------------
    | Combine manual + automatically detected indicators
    |--------------------------------------------------------------------------
    */

    const combinedIndicators = [
      ...new Set([
        ...(Array.isArray(indicators)
          ? indicators
          : []),
        ...automaticIndicators,
      ]),
    ];

    /*
    |--------------------------------------------------------------------------
    | CREATE DATABASE INCIDENT
    |--------------------------------------------------------------------------
    */

    const incident = await Incident.create({
      ...incidentData,

      indicators: combinedIndicators,
      extractedIOCs,

      createdBy: req.user.userId,

      activityTimeline: [
        {
          action: "Incident Created",

          description:
            "Security incident was created.",

          performedBy: req.user.userId,

          timestamp: new Date(),
        },

        ...(extractedIOCs.length > 0
          ? [
              {
                action: "IOCs Extracted",

                description:
                  `${extractedIOCs.length} indicator(s) of compromise were automatically detected.`,

                performedBy:
                  req.user.userId,

                timestamp: new Date(),
              },
            ]
          : []),
      ],
    });

    console.log(
      "✅ Incident created:",
      incident.title
    );

    console.log(
      `🔎 ${extractedIOCs.length} IOC(s) detected`
    );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Incident created successfully",

      incident,

      iocs: extractedIOCs,

      iocCount: extractedIOCs.length,
    });
  } catch (error) {
    console.error(
      "❌ Create Incident Error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Server error while creating incident",

      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL INCIDENTS
|--------------------------------------------------------------------------
| GET /api/incidents
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log(
      "📋 Fetching incidents for user:",
      req.user.userId
    );

    const incidents = await Incident.find({
      createdBy: req.user.userId,
    })
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "assignedTo",
        "name email"
      )
      .populate(
        "activityTimeline.performedBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    console.log(
      `✅ Found ${incidents.length} incidents`
    );

    return res.status(200).json({
      success: true,

      count: incidents.length,

      incidents,
    });
  } catch (error) {
    console.error(
      "❌ Get Incidents Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching incidents",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE INCIDENT
|--------------------------------------------------------------------------
| GET /api/incidents/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const incident =
        await Incident.findOne({
          _id: req.params.id,

          createdBy: req.user.userId,
        })
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email"
          )
          .populate(
            "activityTimeline.performedBy",
            "name email"
          );

      if (!incident) {
        return res.status(404).json({
          success: false,

          message:
            "Incident not found",
        });
      }

      return res.status(200).json({
        success: true,

        incident,
      });
    } catch (error) {
      console.error(
        "❌ Get Incident Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while fetching incident",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE INCIDENT
|--------------------------------------------------------------------------
| PATCH /api/incidents/:id
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const allowedFields = [
        "title",
        "description",
        "severity",
        "status",
        "source",
        "category",
        "affectedSystem",
        "indicators",
        "assignedTo",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (
          req.body[field] !== undefined
        ) {
          updates[field] =
            req.body[field];
        }
      }

      const incident =
        await Incident.findOne({
          _id: req.params.id,

          createdBy: req.user.userId,
        });

      if (!incident) {
        return res.status(404).json({
          success: false,

          message:
            "Incident not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | STATUS CHANGE TIMELINE
      |--------------------------------------------------------------------------
      */

      let timelineEvent;

      if (
        req.body.status !== undefined &&
        req.body.status !==
          incident.status
      ) {
        timelineEvent = {
          action:
            "Status Changed",

          description:
            `Incident status changed from "${incident.status}" to "${req.body.status}".`,

          performedBy:
            req.user.userId,

          timestamp: new Date(),
        };

        if (
          req.body.status ===
          "resolved"
        ) {
          updates.resolvedAt =
            new Date();
        } else {
          updates.resolvedAt = null;
        }
      } else {
        timelineEvent = {
          action:
            "Incident Updated",

          description:
            "Incident information was updated.",

          performedBy:
            req.user.userId,

          timestamp: new Date(),
        };
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE INCIDENT
      |--------------------------------------------------------------------------
      */

      incident.set(updates);

      incident.activityTimeline.push(
        timelineEvent
      );

      await incident.save();

      /*
      |--------------------------------------------------------------------------
      | RETURN UPDATED INCIDENT
      |--------------------------------------------------------------------------
      */

      const updatedIncident =
        await Incident.findById(
          incident._id
        )
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email"
          )
          .populate(
            "activityTimeline.performedBy",
            "name email"
          );

      return res.status(200).json({
        success: true,

        message:
          "Incident updated successfully",

        incident:
          updatedIncident,
      });
    } catch (error) {
      console.error(
        "❌ Update Incident Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while updating incident",

        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE INCIDENT
|--------------------------------------------------------------------------
| DELETE /api/incidents/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const incident =
        await Incident.findOneAndDelete({
          _id: req.params.id,

          createdBy: req.user.userId,
        });

      if (!incident) {
        return res.status(404).json({
          success: false,

          message:
            "Incident not found",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Incident deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Delete Incident Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while deleting incident",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;
