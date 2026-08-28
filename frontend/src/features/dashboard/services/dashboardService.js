import { getIncidents } from "../../../services/incidentService";

const getValidRiskScore = (incident) => {
  const score =
    incident?.aiInvestigation?.riskScore ??
    incident?.riskScore ??
    incident?.aiRiskScore ??
    null;

  const number = Number(score);

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    number > 100
  ) {
    return null;
  }

  return number;
};

const isAIInvestigated = (incident) => {
  return (
    incident?.aiInvestigation?.status ===
      "completed" ||
    getValidRiskScore(incident) !== null
  );
};

export const getDashboardStats = async () => {
  try {
    const response = await getIncidents();

    const incidents =
      Array.isArray(response?.incidents)
        ? response.incidents
        : [];

    // =====================================================
    // TOTAL INCIDENTS
    // =====================================================

    const totalIncidents = incidents.length;

    // =====================================================
    // ACTIVE THREATS
    // High + Critical AND not resolved
    // =====================================================

    const activeThreats = incidents.filter(
      (incident) => {
        const severity = String(
          incident?.severity || ""
        ).toLowerCase();

        const status = String(
          incident?.status || ""
        ).toLowerCase();

        return (
          (severity === "high" ||
            severity === "critical") &&
          status !== "resolved"
        );
      }
    ).length;

    // =====================================================
    // AI INVESTIGATED
    // =====================================================

    const investigatedIncidents =
      incidents.filter(isAIInvestigated);

    const aiInvestigated =
      investigatedIncidents.length;

    // =====================================================
    // RISK SCORES
    // =====================================================

    const riskScores =
      investigatedIncidents
        .map(getValidRiskScore)
        .filter(
          (score) => score !== null
        );

    // =====================================================
    // AVERAGE AI RISK SCORE
    // =====================================================

    const aiRiskScore =
      riskScores.length > 0
        ? Math.round(
            riskScores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) / riskScores.length
          )
        : 0;

    // =====================================================
    // SEVERITY DISTRIBUTION
    // =====================================================

    const severityDistribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    incidents.forEach((incident) => {
      const severity = String(
        incident?.severity || ""
      ).toLowerCase();

      if (
        Object.prototype.hasOwnProperty.call(
          severityDistribution,
          severity
        )
      ) {
        severityDistribution[
          severity
        ] += 1;
      }
    });

    // =====================================================
    // STATUS DISTRIBUTION
    // =====================================================

    const statusDistribution = {
      open: 0,
      investigating: 0,
      resolved: 0,
    };

    incidents.forEach((incident) => {
      const status = String(
        incident?.status || ""
      ).toLowerCase();

      if (
        Object.prototype.hasOwnProperty.call(
          statusDistribution,
          status
        )
      ) {
        statusDistribution[status] += 1;
      }
    });

    // =====================================================
    // THREAT TYPE DISTRIBUTION
    // =====================================================

    const threatTypes = {};

    investigatedIncidents.forEach(
      (incident) => {
        const threatType =
          incident?.aiInvestigation
            ?.threatType;

        if (threatType) {
          threatTypes[threatType] =
            (threatTypes[threatType] || 0) +
            1;
        }
      }
    );

    // =====================================================
    // RECENT INCIDENTS
    // =====================================================

    const recentIncidents =
      [...incidents]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .slice(0, 5);

    // =====================================================
    // RECENT AI INVESTIGATIONS
    // =====================================================

    const recentInvestigations =
      [...investigatedIncidents]
        .sort(
          (a, b) =>
            new Date(
              b.aiInvestigation
                ?.investigatedAt ||
                b.updatedAt ||
                0
            ) -
            new Date(
              a.aiInvestigation
                ?.investigatedAt ||
                a.updatedAt ||
                0
            )
        )
        .slice(0, 5);

    // =====================================================
    // THREAT INTELLIGENCE STATS
    // =====================================================

    const threatIntelStats = {
      total: 0,
      malicious: 0,
      suspicious: 0,
      clean: 0,
      unknown: 0,
    };

    incidents.forEach((incident) => {
      const summary =
        incident?.threatIntelligence
          ?.summary;

      if (!summary) {
        return;
      }

      threatIntelStats.total +=
        Number(summary.total || 0);

      threatIntelStats.malicious +=
        Number(summary.malicious || 0);

      threatIntelStats.suspicious +=
        Number(summary.suspicious || 0);

      threatIntelStats.clean +=
        Number(summary.clean || 0);

      threatIntelStats.unknown +=
        Number(summary.unknown || 0);
    });

    // =====================================================
    // IOC COUNT
    // =====================================================

    const totalIOCs = incidents.reduce(
      (total, incident) => {
        const extractedCount =
          Array.isArray(incident?.extractedIOCs)
            ? incident.extractedIOCs.length
            : 0;

        const indicatorCount =
          Array.isArray(incident?.indicators)
            ? incident.indicators.length
            : 0;

        return total + Math.max(extractedCount, indicatorCount);
      },
      0
    );

    // =====================================================
    // MALICIOUS IOC COUNT
    // =====================================================

    const maliciousIOCs =
      threatIntelStats.malicious;

    // =====================================================
    // DASHBOARD RESULT
    // =====================================================

    const dashboardData = {
      totalIncidents,

      activeThreats,

      aiInvestigated,

      aiRiskScore,

      riskScores,

      severityDistribution,

      statusDistribution,

      threatTypes,

      recentIncidents,

      recentInvestigations,

      threatIntelStats,

      totalIOCs,

      maliciousIOCs,

      lastUpdated: new Date(),
    };

    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
      "📊 SentinelAI Dashboard Data:",
      dashboardData
    );

    return dashboardData;
  } catch (error) {
    console.error(
      "❌ Failed to load dashboard statistics:",
      error
    );

    throw error;
  }
};
