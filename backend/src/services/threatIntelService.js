const axios = require("axios");

const VIRUSTOTAL_BASE_URL =
  "https://www.virustotal.com/api/v3";

const getHeaders = () => {
  if (!process.env.VIRUSTOTAL_API_KEY) {
    throw new Error(
      "VIRUSTOTAL_API_KEY is missing from .env"
    );
  }

  return {
    "x-apikey": process.env.VIRUSTOTAL_API_KEY,
  };
};

// ---------------------------------------------------------
// CHECK IP
// ---------------------------------------------------------

const checkIP = async (ip) => {
  try {
    const response = await axios.get(
      `${VIRUSTOTAL_BASE_URL}/ip_addresses/${encodeURIComponent(
        ip
      )}`,
      {
        headers: getHeaders(),
        timeout: 15000,
      }
    );

    const data = response.data?.data;

    if (!data) {
      throw new Error("VirusTotal returned no IP data");
    }

    const attributes = data.attributes || {};
    const stats =
      attributes.last_analysis_stats || {};

    return {
      success: true,
      type: "ip",
      value: ip,

      malicious:
        Number(stats.malicious || 0),

      suspicious:
        Number(stats.suspicious || 0),

      harmless:
        Number(stats.harmless || 0),

      undetected:
        Number(stats.undetected || 0),

      reputation:
        attributes.reputation ?? 0,

      country:
        attributes.country || null,

      asOwner:
        attributes.as_owner || null,

      network:
        attributes.network || null,

      lastAnalysisDate:
        attributes.last_analysis_date || null,

      raw: data,
    };
  } catch (error) {
    console.error(
      "VirusTotal IP lookup error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "VirusTotal IP lookup failed"
    );
  }
};

// ---------------------------------------------------------
// CHECK DOMAIN
// ---------------------------------------------------------

const checkDomain = async (domain) => {
  try {
    const response = await axios.get(
      `${VIRUSTOTAL_BASE_URL}/domains/${encodeURIComponent(
        domain
      )}`,
      {
        headers: getHeaders(),
        timeout: 15000,
      }
    );

    const data = response.data?.data;

    if (!data) {
      throw new Error(
        "VirusTotal returned no domain data"
      );
    }

    const attributes = data.attributes || {};
    const stats =
      attributes.last_analysis_stats || {};

    return {
      success: true,
      type: "domain",
      value: domain,

      malicious:
        Number(stats.malicious || 0),

      suspicious:
        Number(stats.suspicious || 0),

      harmless:
        Number(stats.harmless || 0),

      undetected:
        Number(stats.undetected || 0),

      reputation:
        attributes.reputation ?? 0,

      registrar:
        attributes.registrar || null,

      creationDate:
        attributes.creation_date || null,

      lastAnalysisDate:
        attributes.last_analysis_date || null,

      categories:
        attributes.categories || {},

      raw: data,
    };
  } catch (error) {
    console.error(
      "VirusTotal domain lookup error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "VirusTotal domain lookup failed"
    );
  }
};

// ---------------------------------------------------------
// CHECK URL
// ---------------------------------------------------------

const checkURL = async (url) => {
  try {
    const urlId = Buffer.from(url)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await axios.get(
      `${VIRUSTOTAL_BASE_URL}/urls/${urlId}`,
      {
        headers: getHeaders(),
        timeout: 15000,
      }
    );

    const data = response.data?.data;

    if (!data) {
      throw new Error(
        "VirusTotal returned no URL data"
      );
    }

    const attributes = data.attributes || {};
    const stats =
      attributes.last_analysis_stats || {};

    return {
      success: true,
      type: "url",
      value: url,

      malicious:
        Number(stats.malicious || 0),

      suspicious:
        Number(stats.suspicious || 0),

      harmless:
        Number(stats.harmless || 0),

      undetected:
        Number(stats.undetected || 0),

      reputation:
        attributes.reputation ?? 0,

      lastAnalysisDate:
        attributes.last_analysis_date || null,

      finalUrl:
        attributes.last_final_url || null,

      title:
        attributes.title || null,

      raw: data,
    };
  } catch (error) {
    console.error(
      "VirusTotal URL lookup error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "VirusTotal URL lookup failed"
    );
  }
};

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------

module.exports = {
  checkIP,
  checkDomain,
  checkURL,
};