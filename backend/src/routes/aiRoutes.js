const express = require("express");

const Incident = require("../models/Incident");

const {
  investigateIncident,
} = require("../services/aiService");

const {
  analyzeIncidentThreatIntel,
} = require("../services/threatAnalysisService");

const {
  extractIOCsFromIncident,
} = require("../services/iocService");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AI INVESTIGATION
|--------------------------------------------------------------------------
| POST /api/ai/investigate/:incidentId
|--------------------------------------------------------------------------
*/

router.post(
  "/investigate/:incidentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { incidentId } = req.params;
      const userId = req.user.userId;

      console.log("=================================");
      console.log("🔍 SentinelAI Investigation Started");
      console.log("Incident ID:", incidentId);
      console.log("User ID:", userId);
      console.log("=================================");

      /*
      |--------------------------------------------------------------------------
      | FIND INCIDENT
      |--------------------------------------------------------------------------
      */

      const incident = await Incident.findOne({
        _id: incidentId,
        createdBy: userId,
      });

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: "Incident not found",
        });
      }

      console.log(
        "✅ Incident found:",
        incident.title
      );

      /*
      |--------------------------------------------------------------------------
      | STEP 0 — IOC EXTRACTION
      |--------------------------------------------------------------------------
      */

      console.log("");
      console.log("🔎 STEP 0: IOC Extraction");
      console.log("=================================");

      let extractedIOCs = [];

      try {
        extractedIOCs =
          extractIOCsFromIncident(incident);

        console.log(
          `📌 ${extractedIOCs.length} IOCs detected`
        );

        console.log(extractedIOCs);

        incident.activityTimeline.push({
          action: "IOC Extraction Completed",
          description: `SentinelAI detected ${extractedIOCs.length} indicator(s) of compromise.`,
          performedBy: userId,
          timestamp: new Date(),
        });

        incident.extractedIOCs = extractedIOCs;
        incident.indicators = [
          ...new Set([
            ...(Array.isArray(incident.indicators)
              ? incident.indicators
              : []),
            ...extractedIOCs.map((ioc) => ioc.value),
          ]),
        ];

        await incident.save();
      } catch (error) {
        console.error(
          "❌ IOC extraction failed:",
          error.message
        );
      }

      /*
      |--------------------------------------------------------------------------
      | MARK INVESTIGATION STARTED
      |--------------------------------------------------------------------------
      */

      if (!incident.aiInvestigation) {
        incident.aiInvestigation = {};
      }

      incident.aiInvestigation.status =
        "investigating";

      /*
      |--------------------------------------------------------------------------
      | THREAT INTELLIGENCE STATUS
      |--------------------------------------------------------------------------
      */

      if (!incident.threatIntelligence) {
        incident.threatIntelligence = {};
      }

      incident.threatIntelligence.status =
        "analyzing";

      incident.activityTimeline.push({
        action: "AI Investigation Started",
        description:
          "SentinelAI started automated security analysis.",
        performedBy: userId,
        timestamp: new Date(),
      });

      await incident.save();

      /*
      |--------------------------------------------------------------------------
      | STEP 1 — THREAT INTELLIGENCE
      |--------------------------------------------------------------------------
      */

      console.log("");
      console.log(
        "🛡️ STEP 1: Threat Intelligence Analysis"
      );
      console.log("=================================");

      let threatIntelResult = null;

      try {
        threatIntelResult =
          await analyzeIncidentThreatIntel(
            incident
          );

        incident.threatIntelligence.status =
          "completed";

        incident.threatIntelligence.lastAnalyzedAt =
          new Date();

        incident.threatIntelligence.summary =
          threatIntelResult.summary;

        incident.threatIntelligence.results =
          threatIntelResult.results;

        incident.activityTimeline.push({
          action:
            "Threat Intelligence Completed",

          description:
            `VirusTotal analyzed ${threatIntelResult.summary.total} indicator(s). ${threatIntelResult.summary.malicious} malicious, ${threatIntelResult.summary.suspicious} suspicious, ${threatIntelResult.summary.clean} clean and ${threatIntelResult.summary.unknown} unknown.`,

          performedBy: userId,

          timestamp: new Date(),
        });

        await incident.save();

        console.log(
          "✅ Threat Intelligence saved"
        );
      } catch (error) {
        console.error(
          "❌ Threat Intelligence failed:",
          error.message
        );

        incident.threatIntelligence.status =
          "failed";

        incident.activityTimeline.push({
          action:
            "Threat Intelligence Failed",

          description:
            `Threat intelligence analysis failed: ${error.message}`,

          performedBy: userId,

          timestamp: new Date(),
        });

        await incident.save();

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | We continue to Gemini even if VirusTotal fails.
        |--------------------------------------------------------------------------
        */
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 2 — GEMINI AI INVESTIGATION
      |--------------------------------------------------------------------------
      */

      console.log("");
      console.log(
        "🤖 STEP 2: Gemini AI Investigation"
      );
      console.log("=================================");

      const aiResult =
        await investigateIncident(
          incident
        );

      console.log(
        "✅ Gemini investigation completed"
      );

      console.log(
        "📥 Gemini raw response:"
      );

      console.log(
        JSON.stringify(
          aiResult,
          null,
          2
        )
      );

      /*
      |--------------------------------------------------------------------------
      | SAVE AI RESULT
      |--------------------------------------------------------------------------
      */

      incident.aiInvestigation.status =
        "completed";

      incident.aiInvestigation.analysis =
        aiResult.threatAssessment || "";

      incident.aiInvestigation.threatType =
        aiResult.threatType || "";

      incident.aiInvestigation.riskScore =
        typeof aiResult.riskScore === "number"
          ? aiResult.riskScore
          : null;

      incident.aiInvestigation.keyFindings =
        Array.isArray(
          aiResult.keyFindings
        )
          ? aiResult.keyFindings
          : [];

      incident.aiInvestigation.recommendedActions =
        Array.isArray(
          aiResult.recommendedResponse
        )
          ? aiResult.recommendedResponse
          : [];

      incident.aiInvestigation.confidenceLevel =
        aiResult.confidence || "";

      incident.aiInvestigation.investigatedAt =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | TIMELINE — AI COMPLETED
      |--------------------------------------------------------------------------
      */

      incident.activityTimeline.push({
        action:
          "AI Investigation Completed",

        description:
          `Gemini completed the investigation with a risk score of ${aiResult.riskScore}/100 and ${aiResult.confidence || "unknown"} confidence.`,

        performedBy: userId,

        timestamp: new Date(),
      });

      /*
      |--------------------------------------------------------------------------
      | SAVE FINAL INCIDENT
      |--------------------------------------------------------------------------
      */

      await incident.save();

      console.log("");
      console.log(
        "💾 Investigation saved to MongoDB"
      );

      /*
      |--------------------------------------------------------------------------
      | GET FULL UPDATED INCIDENT
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

      /*
      |--------------------------------------------------------------------------
      | FINAL RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "AI investigation completed successfully",

        incidentId:
          updatedIncident._id,

        incident:
          updatedIncident,

        extractedIOCs,

        threatIntelligence:
          updatedIncident.threatIntelligence,

        aiInvestigation:
          updatedIncident.aiInvestigation,

        activityTimeline:
          updatedIncident.activityTimeline,
      });
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | GLOBAL INVESTIGATION ERROR
      |--------------------------------------------------------------------------
      */

      console.error(
        "❌ AI INVESTIGATION ERROR"
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Stack:",
        error.stack
      );

      /*
      |--------------------------------------------------------------------------
      | MARK INVESTIGATION FAILED
      |--------------------------------------------------------------------------
      */

      try {
        const { incidentId } =
          req.params;

        const incident =
          await Incident.findOne({
            _id: incidentId,
            createdBy:
              req.user.userId,
          });

        if (incident) {
          if (!incident.aiInvestigation) {
            incident.aiInvestigation = {};
          }

          incident.aiInvestigation.status =
            "failed";

          incident.activityTimeline.push({
            action:
              "AI Investigation Failed",

            description:
              `SentinelAI was unable to complete the investigation: ${error.message}`,

            performedBy:
              req.user.userId,

            timestamp: new Date(),
          });

          await incident.save();
        }
      } catch (saveError) {
        console.error(
          "❌ Could not update investigation status:",
          saveError.message
        );
      }

      return res.status(500).json({
        success: false,

        message:
          "Unable to complete AI investigation",

        error:
          error.message,
      });
    }
  }
);

module.exports = router;
