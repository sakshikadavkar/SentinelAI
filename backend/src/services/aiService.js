const { GoogleGenAI } = require("@google/genai");

const {
  extractIOCsFromIncident,
} = require("./iocService");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| AI INCIDENT INVESTIGATION
|--------------------------------------------------------------------------
*/

const investigateIncident = async (incident) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing from backend environment"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EXTRACT IOCs
  |--------------------------------------------------------------------------
  */

  const extractedIOCs =
    extractIOCsFromIncident(incident);

  console.log("🔎 Extracted IOCs:");
  console.log(extractedIOCs);

  /*
  |--------------------------------------------------------------------------
  | FORMAT IOCs FOR AI
  |--------------------------------------------------------------------------
  */

  const iocSummary =
    extractedIOCs.length > 0
      ? extractedIOCs
          .map(
            (ioc) =>
              `${ioc.type}: ${ioc.value}`
          )
          .join("\n")
      : "No IOCs detected.";

  /*
  |--------------------------------------------------------------------------
  | INCIDENT DATA
  |--------------------------------------------------------------------------
  */

  const prompt = `
You are SentinelAI, an AI-powered cybersecurity incident response analyst.

Analyze the following security incident.

IMPORTANT RULES:

- Do not invent evidence.
- Clearly distinguish observed facts from your assessment.
- Treat indicators as suspicious, not automatically malicious.
- Use the extracted IOCs as investigation evidence.
- Do not claim an IOC is malicious unless the provided incident evidence supports that assessment.
- Focus only on defensive cybersecurity.
- Provide practical incident-response recommendations.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not use code fences.

INCIDENT

Title:
${incident.title || "Not specified"}

Description:
${incident.description || "Not specified"}

Severity:
${incident.severity || "Not specified"}

Category:
${incident.category || "Not specified"}

Source:
${incident.source || "Unknown"}

Affected System:
${incident.affectedSystem || "Not specified"}

EXTRACTED INDICATORS OF COMPROMISE

${iocSummary}

Return exactly this JSON structure:

{
  "riskScore": 0,
  "threatType": "Threat category",
  "confidence": "High",
  "threatAssessment": "Professional assessment",
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "recommendedResponse": [
    "Action 1",
    "Action 2",
    "Action 3"
  ]
}

RULES:

- riskScore must be an integer between 0 and 100.
- confidence must be exactly one of: Low, Medium, High.
- threatType must be a concise cybersecurity threat category.
- threatAssessment must be based only on the supplied incident information.
- keyFindings must contain 2 to 5 items.
- recommendedResponse must contain 2 to 5 practical defensive actions.
`;

  console.log(
    "🤖 Sending incident and IOCs to Gemini..."
  );

  /*
  |--------------------------------------------------------------------------
  | GEMINI REQUEST
  |--------------------------------------------------------------------------
  */

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents: prompt,
  });

  console.log(
    "✅ Gemini investigation completed"
  );

  /*
  |--------------------------------------------------------------------------
  | READ RESPONSE
  |--------------------------------------------------------------------------
  */

  const text = String(response.text || "").trim();

  if (!text) {
    throw new Error(
      "Gemini returned an empty investigation response"
    );
  }

  console.log(
    "📥 Gemini raw response:"
  );
  console.log(text);

  /*
  |--------------------------------------------------------------------------
  | PARSE JSON
  |--------------------------------------------------------------------------
  */

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    console.error(
      "❌ Gemini returned invalid JSON:"
    );

    console.error(text);

    throw new Error(
      "Gemini returned an invalid investigation format"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE RISK SCORE
  |--------------------------------------------------------------------------
  */

  if (
    typeof result.riskScore !== "number" ||
    !Number.isInteger(result.riskScore) ||
    result.riskScore < 0 ||
    result.riskScore > 100
  ) {
    throw new Error(
      "Invalid AI risk score"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE THREAT TYPE
  |--------------------------------------------------------------------------
  */

  if (
    typeof result.threatType !== "string" ||
    !result.threatType.trim()
  ) {
    throw new Error(
      "Invalid AI threat type"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE CONFIDENCE
  |--------------------------------------------------------------------------
  */

  if (
    !["Low", "Medium", "High"].includes(
      result.confidence
    )
  ) {
    throw new Error(
      "Invalid AI confidence level"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE THREAT ASSESSMENT
  |--------------------------------------------------------------------------
  */

  if (
    typeof result.threatAssessment !==
      "string" ||
    !result.threatAssessment.trim()
  ) {
    throw new Error(
      "Invalid AI threat assessment"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE KEY FINDINGS
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(result.keyFindings) ||
    result.keyFindings.length < 2 ||
    result.keyFindings.length > 5
  ) {
    throw new Error(
      "Invalid AI key findings"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE RECOMMENDED RESPONSE
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(
      result.recommendedResponse
    ) ||
    result.recommendedResponse.length < 2 ||
    result.recommendedResponse.length > 5
  ) {
    throw new Error(
      "Invalid AI recommended response"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RETURN RESULT
  |--------------------------------------------------------------------------
  */

  return {
    ...result,

    /*
    | Keep extracted IOCs available to the
    | next backend layer.
    */
    extractedIOCs,
  };
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
  investigateIncident,
};
