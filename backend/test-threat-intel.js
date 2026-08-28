require("dotenv").config();

const {
  checkIP,
  checkDomain,
  checkURL,
} = require("./src/services/threatIntelService");

console.log("=================================");
console.log("🛡️ SentinelAI Threat Intelligence Test");
console.log("=================================");

if (!process.env.VIRUSTOTAL_API_KEY) {
  console.error("❌ VIRUSTOTAL_API_KEY is missing");
  process.exit(1);
}

console.log("✅ VirusTotal API key loaded");

/*
|--------------------------------------------------------------------------
| TEST IP
|--------------------------------------------------------------------------
*/

(async () => {
  console.log("");
  console.log("🔎 Testing IP: 185.220.101.42");

  try {
    const result = await checkIP(
      "185.220.101.42"
    );

    console.log("✅ IP lookup successful:");

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ IP lookup failed:"
    );

    console.error(error.message);
  }

  /*
  |--------------------------------------------------------------------------
  | TEST DOMAIN
  |--------------------------------------------------------------------------
  */

  console.log("");
  console.log("🔎 Testing domain: example.com");

  try {
    const result = await checkDomain(
      "example.com"
    );

    console.log(
      "✅ Domain lookup successful:"
    );

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ Domain lookup failed:"
    );

    console.error(error.message);
  }

  /*
  |--------------------------------------------------------------------------
  | TEST URL
  |--------------------------------------------------------------------------
  */

  console.log("");
  console.log(
    "🔎 Testing URL: https://example.com"
  );

  try {
    const result = await checkURL(
      "https://example.com"
    );

    console.log(
      "✅ URL lookup successful:"
    );

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ URL lookup failed:"
    );

    console.error(error.message);
  }

  console.log("");
  console.log("=================================");
  console.log(
    "✅ Threat intelligence test completed"
  );
  console.log("=================================");
})();