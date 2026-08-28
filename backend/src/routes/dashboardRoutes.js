const express = require("express");
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET DASHBOARD STATISTICS
|--------------------------------------------------------------------------
| GET /api/dashboard/stats
| Requires JWT authentication
|--------------------------------------------------------------------------
*/

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all incidents created by the logged-in user
    const incidents = await Incident.find({
      createdBy: userId,
    }).sort({ createdAt: -1 });

    // ---------------------------------------------------------
    // Active Threats
    // ---------------------------------------------------------

    const activeThreats = incidents.filter(
      (incident) =>
        incident.status === "open" ||
        incident.status === "investigating"
    ).length;

    // ---------------------------------------------------------
    // Severity Counts
    // ---------------------------------------------------------

    const severity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    incidents.forEach((incident) => {
      if (severity[incident.severity] !== undefined) {
        severity[incident.severity]++;
      }
    });

    // ---------------------------------------------------------
    // AI Risk Score
    // ---------------------------------------------------------

    const investigatedIncidents = incidents.filter(
      (incident) =>
        incident.aiInvestigation?.riskScore !== null &&
        incident.aiInvestigation?.riskScore !== undefined
    );

    let aiRiskScore = 0;

    if (investigatedIncidents.length > 0) {
      const totalRisk = investigatedIncidents.reduce(
        (sum, incident) =>
          sum + incident.aiInvestigation.riskScore,
        0
      );

      aiRiskScore = Math.round(
        totalRisk / investigatedIncidents.length
      );
    }

    // ---------------------------------------------------------
    // Threat Activity - Last 7 Days
    // ---------------------------------------------------------

    const now = new Date();

    const threatActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = incidents.filter((incident) => {
        const createdAt = new Date(incident.createdAt);

        return (
          createdAt >= date &&
          createdAt < nextDate
        );
      }).length;

      threatActivity.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // ---------------------------------------------------------
    // Recent Incidents
    // ---------------------------------------------------------

    const recentIncidents = incidents
      .slice(0, 5)
      .map((incident) => ({
        id: incident._id,
        title: incident.title,
        category: incident.category,
        severity: incident.severity,
        status: incident.status,
        source: incident.source,
        createdAt: incident.createdAt,
        riskScore:
          incident.aiInvestigation?.riskScore ?? null,
      }));

    // ---------------------------------------------------------
    // Live Threat Feed
    // ---------------------------------------------------------

    const liveThreatFeed = incidents
      .slice(0, 5)
      .map((incident) => ({
        id: incident._id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        category: incident.category,
        createdAt: incident.createdAt,
      }));

    // ---------------------------------------------------------
    // Response
    // ---------------------------------------------------------

    return res.status(200).json({
      success: true,

      stats: {
        aiRiskScore,
        activeThreats,
        totalIncidents: incidents.length,

        severity,

        threatActivity,

        recentIncidents,

        liveThreatFeed,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard statistics",
    });
  }
});

module.exports = router;