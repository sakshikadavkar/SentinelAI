require("dotenv").config();

const {
  analyzeIncidentThreatIntel,
} = require("./src/services/threatAnalysisService");

const testIncident = {
  title: "Suspicious Network Activity",

  description:
    "Connection detected from 185.220.101.42 attempting to access evil-example.com",

  severity: "high",

  category: "network_attack",

  source: "IDS",

  affectedSystem: "Web Server",

  indicators: [
    "185.220.101.42",
    "https://example.com",
  ],
};

const runTest = async () => {
  console.log("=================================");
  console.log("🧪 SentinelAI Threat Analysis Test");
  console.log("=================================");

  try {
    const result =
      await analyzeIncidentThreatIntel(
        testIncident
      );

    console.log("");
    console.log("📊 FINAL RESULT");
    console.log(
      JSON.stringify(result, null, 2)
    );

    console.log("");
    console.log("=================================");
    console.log("✅ Threat analysis test completed");
    console.log("=================================");
  } catch (error) {
    console.error("");
    console.error(
      "❌ Threat analysis test failed:"
    );
    console.error(error.message);
  }
};

runTest();