const {
  checkIP,
  checkDomain,
  checkURL,
} = require("./threatIntelService");

const {
  extractIOCsFromIncident,
} = require("./iocService");

// ---------------------------------------------------------
// THREAT INTELLIGENCE ANALYSIS
// ---------------------------------------------------------

const analyzeIncidentThreatIntel = async (incident) => {
  console.log("=================================");
  console.log("🔎 Starting Threat Intelligence Analysis");
  console.log("Incident:", incident.title);
  console.log("=================================");

  const iocs = extractIOCsFromIncident(incident);

  console.log(`📌 ${iocs.length} IOCs detected`);

  if (iocs.length === 0) {
    return {
      success: true,
      iocs: [],
      results: [],
      summary: {
        total: 0,
        malicious: 0,
        suspicious: 0,
        clean: 0,
        unknown: 0,
      },
    };
  }

  const results = [];

  for (const ioc of iocs) {
    try {
      console.log(
        `🔍 Checking ${ioc.type}: ${ioc.value}`
      );

      let result = null;

      // ---------------------------------------------------
      // IPv4
      // ---------------------------------------------------

      if (ioc.type === "ipv4") {
        result = await checkIP(ioc.value);
      }

      // ---------------------------------------------------
      // Domain
      // ---------------------------------------------------

      else if (ioc.type === "domain") {
        result = await checkDomain(ioc.value);
      }

      // ---------------------------------------------------
      // URL
      // ---------------------------------------------------

      else if (ioc.type === "url") {
        result = await checkURL(ioc.value);
      }

      // ---------------------------------------------------
      // Unsupported IOC
      // ---------------------------------------------------

      else {
        result = {
          success: true,
          type: ioc.type,
          value: ioc.value,
          status: "unsupported",
          message:
            "VirusTotal lookup is not currently implemented for this IOC type.",
        };
      }

      results.push({
        ...ioc,
        threatIntel: result,
      });

      console.log(
        `✅ Completed: ${ioc.value}`
      );
    } catch (error) {
      console.error(
        `❌ Threat intelligence failed for ${ioc.value}:`,
        error.message
      );

      results.push({
        ...ioc,

        threatIntel: {
          success: false,
          type: ioc.type,
          value: ioc.value,
          status: "error",
          error: error.message,
        },
      });
    }
  }

  // -------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------

  let malicious = 0;
  let suspicious = 0;
  let clean = 0;
  let unknown = 0;

  results.forEach((item) => {
    const intel = item.threatIntel;

    if (!intel || intel.success === false) {
      unknown++;
      return;
    }

    const maliciousCount =
      Number(intel.malicious || 0);

    const suspiciousCount =
      Number(intel.suspicious || 0);

    const harmlessCount =
      Number(intel.harmless || 0);

    const undetectedCount =
      Number(intel.undetected || 0);

    if (maliciousCount > 0) {
      malicious++;
    } else if (suspiciousCount > 0) {
      suspicious++;
    } else if (
      harmlessCount > 0 &&
      undetectedCount >= 0
    ) {
      clean++;
    } else {
      unknown++;
    }
  });

  const summary = {
    total: results.length,
    malicious,
    suspicious,
    clean,
    unknown,
  };

  console.log("=================================");
  console.log("🛡️ Threat Intelligence Completed");
  console.log("Summary:", summary);
  console.log("=================================");

  return {
    success: true,
    iocs,
    results,
    summary,
  };
};

module.exports = {
  analyzeIncidentThreatIntel,
};