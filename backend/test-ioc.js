const {
  extractIOCsFromText,
  extractIOCsFromIncident,
} = require("./src/services/iocService");

console.log("\n=================================");
console.log("🧪 SentinelAI IOC Extraction Test");
console.log("=================================\n");

const testText = `
Suspicious login detected from 185.220.101.42.

The attacker contacted evil-example.com
and downloaded:

https://evil-example.com/payload.exe

Malicious file hash:
44d88612fea8a8f36de82e1278abb02f

Contact email:
attacker@evil-example.com
`;

const textResults =
  extractIOCsFromText(testText, "test");

console.log("📌 IOCs extracted from text:\n");

console.log(
  JSON.stringify(textResults, null, 2)
);


/*
|--------------------------------------------------------------------------
| INCIDENT TEST
|--------------------------------------------------------------------------
*/

const testIncident = {
  title:
    "Suspicious connection detected",

  description:
    "Host connected to 185.220.101.42 and evil-example.com",

  source:
    "IDS",

  affectedSystem:
    "Production Web Server",

  indicators: [
    "https://evil-example.com/login",
    "44d88612fea8a8f36de82e1278abb02f",
  ],
};

const incidentResults =
  extractIOCsFromIncident(testIncident);

console.log(
  "\n📌 IOCs extracted from incident:\n"
);

console.log(
  JSON.stringify(
    incidentResults,
    null,
    2
  )
);

console.log(
  "\n================================="
);

console.log(
  "✅ IOC extraction test completed"
);

console.log(
  "=================================\n"
);