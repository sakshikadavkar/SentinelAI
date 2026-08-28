
/*
|--------------------------------------------------------------------------
| IOC SERVICE
|--------------------------------------------------------------------------
| Extracts and classifies Indicators of Compromise (IOCs)
|
| Supported:
| - IPv4
| - IPv6
| - Domains
| - URLs
| - MD5
| - SHA1
| - SHA256
| - Email addresses
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| REGEX PATTERNS
|--------------------------------------------------------------------------
*/

const PATTERNS = {
  ipv4:
    /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,

  ipv6:
    /\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b/g,

  url:
    /\bhttps?:\/\/[^\s<>"']+/gi,

  email:
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,

  sha256:
    /\b[a-fA-F0-9]{64}\b/g,

  sha1:
    /\b[a-fA-F0-9]{40}\b/g,

  md5:
    /\b[a-fA-F0-9]{32}\b/g,

  domain:
    /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g,
};

/*
|--------------------------------------------------------------------------
| NORMALIZE VALUE
|--------------------------------------------------------------------------
*/

const normalizeValue = (value) => {
  return String(value)
    .trim()
    .replace(/[),.;]+$/g, "");
};

/*
|--------------------------------------------------------------------------
| ADD IOC
|--------------------------------------------------------------------------
*/

const addIOC = (
  collection,
  type,
  value,
  source = "unknown"
) => {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return;
  }

  const key = `${type}:${normalizedValue.toLowerCase()}`;

  if (collection.has(key)) {
    return;
  }

  collection.set(key, {
    type,
    value: normalizedValue,
    source,
  });
};

/*
|--------------------------------------------------------------------------
| EXTRACT IOCs FROM TEXT
|--------------------------------------------------------------------------
*/

const extractIOCsFromText = (
  text,
  source = "text"
) => {
  const collection = new Map();

  if (!text) {
    return [];
  }

  const input = String(text);

  /*
  |--------------------------------------------------------------------------
  | HASHES
  |--------------------------------------------------------------------------
  */

  const sha256Matches =
    input.match(PATTERNS.sha256) || [];

  sha256Matches.forEach((value) => {
    addIOC(
      collection,
      "sha256",
      value,
      source
    );
  });

  const sha1Matches =
    input.match(PATTERNS.sha1) || [];

  sha1Matches.forEach((value) => {
    addIOC(
      collection,
      "sha1",
      value,
      source
    );
  });

  const md5Matches =
    input.match(PATTERNS.md5) || [];

  md5Matches.forEach((value) => {
    addIOC(
      collection,
      "md5",
      value,
      source
    );
  });

  /*
  |--------------------------------------------------------------------------
  | URLS
  |--------------------------------------------------------------------------
  */

  const urlMatches =
    input.match(PATTERNS.url) || [];

  urlMatches.forEach((value) => {
    addIOC(
      collection,
      "url",
      value,
      source
    );
  });

  /*
  |--------------------------------------------------------------------------
  | EMAILS
  |--------------------------------------------------------------------------
  */

  const emailMatches =
    input.match(PATTERNS.email) || [];

  emailMatches.forEach((value) => {
    addIOC(
      collection,
      "email",
      value,
      source
    );
  });

  /*
  |--------------------------------------------------------------------------
  | IPV4
  |--------------------------------------------------------------------------
  */

  const ipv4Matches =
    input.match(PATTERNS.ipv4) || [];

  ipv4Matches.forEach((value) => {
    addIOC(
      collection,
      "ipv4",
      value,
      source
    );
  });

  /*
  |--------------------------------------------------------------------------
  | IPV6
  |--------------------------------------------------------------------------
  */

  const ipv6Matches =
    input.match(PATTERNS.ipv6) || [];

  ipv6Matches.forEach((value) => {
    addIOC(
      collection,
      "ipv6",
      value,
      source
    );
  });

  /*
  |--------------------------------------------------------------------------
  | DOMAINS
  |--------------------------------------------------------------------------
  */

  const domainMatches =
    input.match(PATTERNS.domain) || [];

  domainMatches.forEach((value) => {
    const isPartOfUrl =
      urlMatches.some((url) =>
        url.includes(value)
      );

    if (!isPartOfUrl) {
      addIOC(
        collection,
        "domain",
        value,
        source
      );
    }
  });

  return Array.from(collection.values());
};

/*
|--------------------------------------------------------------------------
| EXTRACT FROM INCIDENT
|--------------------------------------------------------------------------
*/

const extractIOCsFromIncident = (incident) => {
  const collection = new Map();

  /*
  |--------------------------------------------------------------------------
  | Incident text
  |--------------------------------------------------------------------------
  */

  const incidentText = [
    incident?.title,
    incident?.description,
    incident?.source,
    incident?.affectedSystem,
  ]
    .filter(Boolean)
    .join("\n");

  const textIOCs =
    extractIOCsFromText(
      incidentText,
      "incident"
    );

  textIOCs.forEach((ioc) => {
    const key =
      `${ioc.type}:${ioc.value.toLowerCase()}`;

    collection.set(key, ioc);
  });

  /*
  |--------------------------------------------------------------------------
  | Existing indicators
  |--------------------------------------------------------------------------
  */

  if (Array.isArray(incident?.indicators)) {
    incident.indicators.forEach((indicator) => {
      const extracted =
        extractIOCsFromText(
          indicator,
          "indicator"
        );

      extracted.forEach((ioc) => {
        const key =
          `${ioc.type}:${ioc.value.toLowerCase()}`;

        collection.set(key, ioc);
      });
    });
  }

  return Array.from(collection.values());
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  extractIOCsFromText,
  extractIOCsFromIncident,
};
