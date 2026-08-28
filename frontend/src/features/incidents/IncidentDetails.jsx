import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Server,
  User,
  Loader2,
  RefreshCw,
  Globe,
  Hash,
  Mail,
  Link as LinkIcon,
  ShieldCheck,
  ShieldX,
  HelpCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  getIncident,
  updateIncident,
} from "../../services/incidentService";
import { investigateIncident } from "../../services/aiService";

/*
|--------------------------------------------------------------------------
| Format Value
|--------------------------------------------------------------------------
*/

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Unknown";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) {
    return "Unknown";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleString();
};

/*
|--------------------------------------------------------------------------
| Severity Styles
|--------------------------------------------------------------------------
*/

const severityStyles = {
  critical:
    "bg-red-500/10 border-red-500/30 text-red-400",

  high:
    "bg-orange-500/10 border-orange-500/30 text-orange-400",

  medium:
    "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",

  low:
    "bg-green-500/10 border-green-500/30 text-green-400",
};

/*
|--------------------------------------------------------------------------
| Status Styles
|--------------------------------------------------------------------------
*/

const statusStyles = {
  open:
    "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",

  investigating:
    "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",

  resolved:
    "bg-green-500/10 border-green-500/30 text-green-400",
};

/*
|--------------------------------------------------------------------------
| Risk Color
|--------------------------------------------------------------------------
*/

const getRiskColor = (score) => {
  if (score >= 81) {
    return "text-red-400";
  }

  if (score >= 61) {
    return "text-orange-400";
  }

  if (score >= 31) {
    return "text-yellow-400";
  }

  return "text-green-400";
};

/*
|--------------------------------------------------------------------------
| Risk Background
|--------------------------------------------------------------------------
*/

const getRiskBackground = (score) => {
  if (score >= 81) {
    return "bg-red-500";
  }

  if (score >= 61) {
    return "bg-orange-500";
  }

  if (score >= 31) {
    return "bg-yellow-500";
  }

  return "bg-green-500";
};

/*
|--------------------------------------------------------------------------
| IOC Icon
|--------------------------------------------------------------------------
*/

const getIOCIcon = (type) => {
  switch (String(type).toLowerCase()) {
    case "ipv4":
      return Globe;

    case "url":
      return LinkIcon;

    case "domain":
      return Globe;

    case "email":
      return Mail;

    case "md5":
    case "sha1":
    case "sha256":
      return Hash;

    default:
      return ShieldAlert;
  }
};

/*
|--------------------------------------------------------------------------
| Threat Intelligence Status
|--------------------------------------------------------------------------
*/

const getThreatStatusStyle = (status) => {
  switch (String(status).toLowerCase()) {
    case "malicious":
      return {
        wrapper:
          "bg-red-500/10 border-red-500/20",
        text: "text-red-400",
        icon: ShieldX,
      };

    case "suspicious":
      return {
        wrapper:
          "bg-orange-500/10 border-orange-500/20",
        text: "text-orange-400",
        icon: ShieldAlert,
      };

    case "clean":
    case "harmless":
      return {
        wrapper:
          "bg-green-500/10 border-green-500/20",
        text: "text-green-400",
        icon: ShieldCheck,
      };

    default:
      return {
        wrapper:
          "bg-slate-800/60 border-slate-700",
        text: "text-slate-400",
        icon: HelpCircle,
      };
  }
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IncidentDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [investigating, setInvestigating] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Incident
  |--------------------------------------------------------------------------
  */

  const loadIncident = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIncident(id);

      if (
        response?.success &&
        response?.incident
      ) {
        setIncident(response.incident);
      } else {
        setError(
          response?.message ||
            "Incident not found."
        );
      }
    } catch (err) {
      console.error(
        "❌ Failed to load incident:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load incident."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (id) {
      loadIncident();
    }
  }, [id]);

  const handleStatusChange = async (status) => {
    if (!incident?._id || status === incident.status) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateIncident(incident._id, {
        status,
      });

      if (response?.success && response?.incident) {
        setIncident(response.incident);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update incident status."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAIInvestigation = async () => {
    if (!incident?._id) {
      return;
    }

    try {
      setInvestigating(true);
      setError("");

      const response = await investigateIncident(incident._id);

      if (!response?.success) {
        throw new Error(
          response?.message || "AI investigation failed."
        );
      }

      setIncident(response.incident || incident);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Unable to complete AI investigation."
      );
    } finally {
      setInvestigating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2
            size={22}
            className="animate-spin text-cyan-400"
          />

          Loading incident...
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !incident) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />

          Back
        </button>

        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertTriangle
            size={42}
            className="mx-auto text-red-400"
          />

          <h2 className="text-xl font-semibold text-white mt-4">
            Unable to load incident
          </h2>

          <p className="text-slate-500 mt-2">
            {error ||
              "Incident not found."}
          </p>

          <button
            type="button"
            onClick={loadIncident}
            className="mt-6 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AI Investigation
  |--------------------------------------------------------------------------
  */

  const ai =
    incident.aiInvestigation || null;

  const riskScore =
    typeof ai?.riskScore === "number"
      ? ai.riskScore
      : null;

  const keyFindings =
    Array.isArray(ai?.keyFindings)
      ? ai.keyFindings
      : [];

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT:
  | Gemini uses recommendedResponse in the actual response.
  | Support both names so existing data also works.
  |--------------------------------------------------------------------------
  */

  const recommendedActions =
    Array.isArray(ai?.recommendedResponse)
      ? ai.recommendedResponse
      : Array.isArray(
            ai?.recommendedActions
          )
        ? ai.recommendedActions
        : [];

  /*
  |--------------------------------------------------------------------------
  | Confidence
  |--------------------------------------------------------------------------
  */

  const confidence =
    ai?.confidence ||
    ai?.confidenceLevel ||
    "Unknown";

  /*
  |--------------------------------------------------------------------------
  | Threat Assessment
  |--------------------------------------------------------------------------
  */

  const threatAssessment =
    ai?.threatAssessment ||
    ai?.analysis ||
    "No assessment available.";

  /*
  |--------------------------------------------------------------------------
  | Indicators
  |--------------------------------------------------------------------------
  |
  | Support:
  | 1. incident.indicators
  | 2. ai.extractedIOCs
  | 3. incident.extractedIOCs
  |
  |--------------------------------------------------------------------------
  */

  const rawIndicators =
    Array.isArray(incident.extractedIOCs) &&
    incident.extractedIOCs.length > 0
      ? incident.extractedIOCs
      : Array.isArray(
            ai?.extractedIOCs
          )
        ? ai.extractedIOCs
        : Array.isArray(
              incident.indicators
            )
          ? incident.indicators
          : [];

  const indicators = rawIndicators.map(
    (indicator) => {
      if (
        typeof indicator ===
        "string"
      ) {
        return {
          type: "indicator",
          value: indicator,
          source: "incident",
        };
      }

      return {
        type:
          indicator?.type ||
          "indicator",

        value:
          indicator?.value ||
          indicator?.indicator ||
          "Unknown",

        source:
          indicator?.source ||
          "detected",
      };
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Threat Intelligence
  |--------------------------------------------------------------------------
  */

  const threatIntel =
    incident.threatIntelligence ||
    incident.threatIntel ||
    null;

  const intelResults =
    Array.isArray(
      threatIntel?.results
    )
      ? threatIntel.results
      : Array.isArray(
            threatIntel?.indicators
          )
        ? threatIntel.indicators
        : [];

  /*
  |--------------------------------------------------------------------------
  | Threat Intelligence Counts
  |--------------------------------------------------------------------------
  */

  const getIntelVerdict = (result) => {
    const intel = result?.threatIntel || {};

    if (!intel.success) {
      return "unknown";
    }

    if (Number(intel.malicious || 0) > 0) {
      return "malicious";
    }

    if (Number(intel.suspicious || 0) > 0) {
      return "suspicious";
    }

    if (Number(intel.harmless || 0) > 0) {
      return "clean";
    }

    return "unknown";
  };

  const intelSummary =
    threatIntel?.summary || {};

  const totalIntel =
    Number(
      intelSummary.total ??
        threatIntel?.total ??
        intelResults.length
    );

  const maliciousIntel =
    Number(
      intelSummary.malicious ??
        threatIntel?.malicious ??
        0
    );

  const suspiciousIntel =
    Number(
      intelSummary.suspicious ??
        threatIntel?.suspicious ??
        0
    );

  const cleanIntel =
    Number(
      intelSummary.clean ??
        threatIntel?.clean ??
        0
    );

  const unknownIntel =
    Number(
      intelSummary.unknown ??
        threatIntel?.unknown ??
        0
    );

  /*
  |--------------------------------------------------------------------------
  | Timeline
  |--------------------------------------------------------------------------
  */

  const timeline =
    Array.isArray(
      incident.activityTimeline
    )
      ? [
          ...incident.activityTimeline,
        ].sort(
          (a, b) =>
            new Date(
              b.timestamp
            ) -
            new Date(
              a.timestamp
            )
        )
      : [];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8">

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
          >
            <ArrowLeft size={18} />

            Back to incidents
          </button>

          <div className="flex items-center gap-3">

            <ShieldAlert
              size={32}
              className="text-cyan-400"
            />

            <div>
              <h1 className="text-3xl font-bold text-white">
                {incident.title ||
                  "Untitled incident"}
              </h1>

              <p className="text-slate-500 text-sm mt-1 font-mono">
                ID: {incident._id}
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          onClick={loadIncident}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 transition"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Incident Workflow
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Update response status or run Gemini investigation with VirusTotal enrichment.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={incident.status}
              onChange={(event) =>
                handleStatusChange(event.target.value)
              }
              disabled={saving || investigating}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:opacity-50"
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              type="button"
              onClick={handleAIInvestigation}
              disabled={investigating || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {investigating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Investigating...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  Run AI Investigation
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* ================================================================
          INCIDENT SUMMARY
      ================================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* SEVERITY */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Severity
          </p>

          <span
            className={`inline-flex mt-3 px-3 py-1.5 rounded-full border text-sm font-semibold ${
              severityStyles[
                String(
                  incident.severity ||
                    ""
                ).toLowerCase()
              ] ||
              "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {formatValue(
              incident.severity
            )}
          </span>

        </div>


        {/* STATUS */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Status
          </p>

          <span
            className={`inline-flex mt-3 px-3 py-1.5 rounded-full border text-sm font-semibold ${
              statusStyles[
                String(
                  incident.status ||
                    ""
                ).toLowerCase()
              ] ||
              "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {formatValue(
              incident.status
            )}
          </span>

        </div>


        {/* SOURCE */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Source
          </p>

          <div className="flex items-center gap-2 mt-3">

            <Server
              size={18}
              className="text-cyan-400"
            />

            <span className="text-white">
              {formatValue(
                incident.source
              )}
            </span>

          </div>

        </div>


        {/* CREATED */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Created
          </p>

          <div className="flex items-center gap-2 mt-3">

            <Clock3
              size={18}
              className="text-cyan-400"
            />

            <span className="text-slate-300 text-sm">
              {formatDate(
                incident.createdAt
              )}
            </span>

          </div>

        </div>

      </div>


      {/* ================================================================
          DESCRIPTION
      ================================================================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Incident Description
        </h2>

        <p className="text-slate-300 leading-7">
          {incident.description ||
            "No description provided."}
        </p>

        {incident.category && (
          <div className="mt-5">

            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Category
            </p>

            <span className="inline-flex px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm">
              {formatValue(
                incident.category
              )}
            </span>

          </div>
        )}

        {incident.affectedSystem && (
          <div className="mt-5">

            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Affected System
            </p>

            <div className="flex items-center gap-2 text-slate-300">

              <Server
                size={17}
                className="text-cyan-400"
              />

              {incident.affectedSystem}

            </div>

          </div>
        )}

      </div>


      {/* ================================================================
          INDICATORS OF COMPROMISE
      ================================================================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Indicators of Compromise
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Automatically detected indicators associated with this incident.
            </p>

          </div>

          <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold">
            {indicators.length} detected
          </div>

        </div>


        {indicators.length === 0 ? (

          <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center">

            <ShieldAlert
              size={40}
              className="mx-auto text-slate-700"
            />

            <p className="text-slate-400 mt-4">
              No IOCs automatically detected.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {indicators.map(
              (indicator, index) => {

                const Icon =
                  getIOCIcon(
                    indicator.type
                  );

                return (
                  <div
                    key={`${indicator.type}-${indicator.value}-${index}`}
                    className="bg-slate-800/40 border border-slate-800 rounded-xl p-4"
                  >

                    <div className="flex items-start gap-4">

                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">

                        <Icon
                          size={17}
                          className="text-cyan-400"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            {formatValue(
                              indicator.type
                            )}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-600">
                            {formatValue(
                              indicator.source
                            )}
                          </span>

                        </div>

                        <p className="font-mono text-sm text-cyan-300 mt-2 break-all">
                          {indicator.value}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>


      {/* ================================================================
          THREAT INTELLIGENCE
      ================================================================= */}

      {(threatIntel ||
        intelResults.length > 0) && (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <ShieldCheck
              size={24}
              className="text-cyan-400"
            />

            <div>

              <h2 className="text-xl font-semibold text-white">
                Threat Intelligence
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                VirusTotal analysis of detected indicators.
              </p>

            </div>

          </div>


          {/* SUMMARY */}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">

            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Total
              </p>

              <p className="text-2xl font-bold text-white mt-1">
                {totalIntel}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Malicious
              </p>

              <p className="text-2xl font-bold text-red-400 mt-1">
                {maliciousIntel}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Suspicious
              </p>

              <p className="text-2xl font-bold text-orange-400 mt-1">
                {suspiciousIntel}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Clean
              </p>

              <p className="text-2xl font-bold text-green-400 mt-1">
                {cleanIntel}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Unknown
              </p>

              <p className="text-2xl font-bold text-slate-400 mt-1">
                {unknownIntel}
              </p>
            </div>

          </div>


          {/* RESULTS */}

          {intelResults.length > 0 && (

            <div className="space-y-3">

              {intelResults.map(
                (result, index) => {

                  const status =
                    result.status ||
                    result.verdict ||
                    result.result ||
                    getIntelVerdict(result);

                  const style =
                    getThreatStatusStyle(
                      status
                    );

                  const StatusIcon =
                    style.icon;

                  const value =
                    result.value ||
                    result.indicator ||
                    result.url ||
                    result.ip ||
                    result.domain ||
                    result.hash ||
                    "Unknown";

                  return (
                    <div
                      key={index}
                      className={`border rounded-xl p-4 ${style.wrapper}`}
                    >

                      <div className="flex items-start gap-3">

                        <StatusIcon
                          size={19}
                          className={`${style.text} mt-0.5 shrink-0`}
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className={`text-sm font-semibold capitalize ${style.text}`}
                            >
                              {formatValue(
                                status
                              )}
                            </span>

                            {result.type && (
                              <span className="text-xs text-slate-500">
                                {formatValue(
                                  result.type
                                )}
                              </span>
                            )}

                          </div>

                          <p className="font-mono text-sm text-slate-300 mt-2 break-all">
                            {value}
                          </p>

                          {result.threatIntel?.error && (
                            <p className="text-xs text-red-400 mt-2">
                              {result.threatIntel.error}
                            </p>
                          )}

                          {result.threatIntel?.country && (
                            <p className="text-xs text-slate-500 mt-2">
                              Country:{" "}
                              {result.threatIntel.country}
                            </p>
                          )}

                          {result.threatIntel?.asOwner && (
                            <p className="text-xs text-slate-500 mt-1">
                              AS Owner:{" "}
                              {result.threatIntel.asOwner}
                            </p>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      )}


      {/* ================================================================
          AI INVESTIGATION
      ================================================================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <BrainCircuit
              size={26}
              className="text-cyan-400"
            />

            <div>

              <h2 className="text-xl font-semibold text-white">
                AI Investigation
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Gemini-powered security analysis
              </p>

            </div>

          </div>

          {ai?.status ===
            "completed" && (

            <div className="flex items-center gap-2 text-green-400 text-sm">

              <CheckCircle2 size={18} />

              Completed

            </div>

          )}

        </div>


        {!ai ||
        ai.status === "pending" ||
        riskScore === null ? (

          <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center">

            <BrainCircuit
              size={40}
              className="mx-auto text-slate-700"
            />

            <p className="text-slate-400 mt-4">
              No completed AI investigation available.
            </p>

          </div>

        ) : (

          <div className="space-y-7">

            {/* RISK */}

            <div>

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    AI Risk Score
                  </p>

                  <p
                    className={`text-5xl font-bold mt-2 ${getRiskColor(
                      riskScore
                    )}`}
                  >
                    {riskScore}

                    <span className="text-lg text-slate-600">
                      /100
                    </span>
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-xs text-slate-500">
                    Confidence
                  </p>

                  <p className="text-lg font-semibold text-green-400 mt-1">
                    {confidence}
                  </p>

                </div>

              </div>


              <div className="mt-4 h-3 bg-slate-800 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full transition-all ${getRiskBackground(
                    riskScore
                  )}`}
                  style={{
                    width: `${Math.min(
                      Math.max(
                        riskScore,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* THREAT + STATUS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-slate-800/50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Detected Threat
                </p>

                <p className="text-white font-semibold mt-2">
                  {ai.threatType ||
                    "Unknown"}
                </p>

              </div>


              <div className="bg-slate-800/50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Investigation Status
                </p>

                <p className="text-green-400 font-semibold mt-2 capitalize">
                  {formatValue(
                    ai.status ||
                      "completed"
                  )}
                </p>

              </div>

            </div>


            {/* ASSESSMENT */}

            <div>

              <h3 className="text-sm font-semibold text-white mb-3">
                AI Threat Assessment
              </h3>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5">

                <p className="text-slate-300 leading-7">
                  {threatAssessment}
                </p>

              </div>

            </div>


            {/* KEY FINDINGS */}

            {keyFindings.length > 0 && (

              <div>

                <h3 className="text-sm font-semibold text-white mb-3">
                  Key Findings
                </h3>

                <div className="space-y-3">

                  {keyFindings.map(
                    (finding, index) => (

                      <div
                        key={index}
                        className="flex gap-3 bg-slate-800/40 rounded-xl p-4"
                      >

                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 text-xs shrink-0">
                          {index + 1}
                        </span>

                        <p className="text-slate-300 text-sm leading-6">
                          {finding}
                        </p>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* RECOMMENDED RESPONSE */}

            {recommendedActions.length > 0 && (

              <div>

                <h3 className="text-sm font-semibold text-white mb-3">
                  Recommended Response
                </h3>

                <div className="space-y-3">

                  {recommendedActions.map(
                    (action, index) => (

                      <div
                        key={index}
                        className="flex gap-3 bg-slate-800/40 rounded-xl p-4"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400 shrink-0 mt-0.5"
                        />

                        <p className="text-slate-300 text-sm leading-6">
                          {action}
                        </p>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* INVESTIGATION TIME */}

            {ai.investigatedAt && (

              <div className="pt-4 border-t border-slate-800">

                <p className="text-xs text-slate-600">

                  Investigation completed{" "}

                  {formatDate(
                    ai.investigatedAt
                  )}

                </p>

              </div>

            )}

          </div>

        )}

      </div>


      {/* ================================================================
          ACTIVITY TIMELINE
      ================================================================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <Clock3
            size={22}
            className="text-cyan-400"
          />

          <div>

            <h2 className="text-xl font-semibold text-white">
              Activity Timeline
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Incident investigation history
            </p>

          </div>

        </div>


        {timeline.length === 0 ? (

          <p className="text-slate-500">
            No activity recorded.
          </p>

        ) : (

          <div className="space-y-5">

            {timeline.map(
              (event, index) => (

                <div
                  key={index}
                  className="flex gap-4"
                >

                  <div className="flex flex-col items-center">

                    <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">

                      <ShieldAlert
                        size={16}
                        className="text-cyan-400"
                      />

                    </div>

                    {index !==
                      timeline.length - 1 && (

                      <div className="w-px flex-1 bg-slate-800 mt-2" />

                    )}

                  </div>


                  <div className="pb-2 flex-1">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">

                      <p className="text-white font-medium">
                        {event.action ||
                          "Activity"}
                      </p>

                      <p className="text-xs text-slate-600">
                        {formatDate(
                          event.timestamp
                        )}
                      </p>

                    </div>


                    <p className="text-slate-400 text-sm mt-1 leading-6">
                      {event.description ||
                        "No description available."}
                    </p>


                    {event.performedBy && (

                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">

                        <User size={12} />

                        {typeof event.performedBy ===
                        "object"
                          ? event
                              .performedBy
                              .name ||
                            event
                              .performedBy
                              .email ||
                            "User"
                          : "User"}

                      </div>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}
