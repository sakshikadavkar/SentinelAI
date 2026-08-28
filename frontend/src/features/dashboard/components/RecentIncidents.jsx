import { useEffect, useState } from "react";

import {
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  Brain,
} from "lucide-react";

import { getIncidents } from "../../../services/incidentService";

/*
|--------------------------------------------------------------------------
| Severity Styles
|--------------------------------------------------------------------------
*/

const severityStyles = {
  critical: "bg-red-500/20 text-red-400 border-red-500/20",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  low: "bg-green-500/20 text-green-400 border-green-500/20",
};

/*
|--------------------------------------------------------------------------
| Status Styles
|--------------------------------------------------------------------------
*/

const statusStyles = {
  open: "bg-yellow-500/20 text-yellow-400",
  investigating: "bg-cyan-500/20 text-cyan-400",
  resolved: "bg-green-500/20 text-green-400",
};

/*
|--------------------------------------------------------------------------
| Risk Styles
|--------------------------------------------------------------------------
*/

const getRiskStyle = (score) => {
  if (typeof score !== "number") {
    return {
      text: "text-slate-500",
      bg: "bg-slate-800",
    };
  }

  if (score >= 81) {
    return {
      text: "text-red-400",
      bg: "bg-red-500/10",
    };
  }

  if (score >= 61) {
    return {
      text: "text-orange-400",
      bg: "bg-orange-500/10",
    };
  }

  if (score >= 31) {
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
    };
  }

  return {
    text: "text-green-400",
    bg: "bg-green-500/10",
  };
};

/*
|--------------------------------------------------------------------------
| Format Text
|--------------------------------------------------------------------------
*/

const formatValue = (value) => {
  if (!value) {
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
| Get AI Investigation
|--------------------------------------------------------------------------
*/

const getAIInvestigation = (incident) => {
  return incident?.aiInvestigation || null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function RecentIncidents() {
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Real MongoDB Incidents
  |--------------------------------------------------------------------------
  */

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIncidents();

      const realIncidents =
        Array.isArray(response?.incidents)
          ? response.incidents
          : [];

      /*
      |--------------------------------------------------------------------------
      | Sort Newest First
      |--------------------------------------------------------------------------
      */

      const sortedIncidents =
        [...realIncidents].sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

      /*
      |--------------------------------------------------------------------------
      | Show Latest 5
      |--------------------------------------------------------------------------
      */

      setIncidents(
        sortedIncidents.slice(0, 5)
      );

      console.log(
        "📋 Recent incidents loaded:",
        sortedIncidents.slice(0, 5)
      );
    } catch (err) {
      console.error(
        "❌ Failed to load recent incidents:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load recent incidents."
      );

      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load + Auto Refresh
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadIncidents();

    const interval =
      setInterval(() => {
        loadIncidents();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            Recent Incidents
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest security incidents and AI analysis
          </p>

        </div>

        <button
          type="button"
          onClick={loadIncidents}
          disabled={loading}
          className="text-slate-400 hover:text-cyan-400 transition disabled:opacity-50"
          title="Refresh incidents"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-4">

          <AlertCircle
            size={18}
            className="text-red-400 shrink-0 mt-0.5"
          />

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="py-10 text-center text-slate-500">
          Loading recent incidents...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        incidents.length === 0 && (
          <div className="py-10 text-center">

            <ShieldAlert
              size={42}
              className="mx-auto text-slate-700"
            />

            <p className="text-slate-400 mt-4">
              No incidents recorded yet.
            </p>

            <p className="text-slate-600 text-sm mt-1">
              Create an incident to see it here.
            </p>

          </div>
        )}

      {/* INCIDENT LIST */}

      {!loading &&
        !error &&
        incidents.length > 0 && (

          <div className="space-y-3">

            {incidents.map((incident) => {

              const severity =
                String(
                  incident?.severity || ""
                ).toLowerCase();

              const status =
                String(
                  incident?.status || ""
                ).toLowerCase();

              const ai =
                getAIInvestigation(
                  incident
                );

              const riskScore =
                typeof ai?.riskScore ===
                "number"
                  ? ai.riskScore
                  : null;

              const riskStyle =
                getRiskStyle(
                  riskScore
                );

              const aiCompleted =
                ai?.status ===
                "completed";

              return (
                <div
                  key={incident._id}
                  className="group rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200"
                >

                  {/* TOP ROW */}

                  <div className="flex items-start justify-between gap-4">

                    {/* INCIDENT INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2 w-2 rounded-full ${
                            severity === "critical"
                              ? "bg-red-400"
                              : severity === "high"
                              ? "bg-orange-400"
                              : severity === "medium"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                        />

                        <h3 className="font-semibold text-white truncate">
                          {incident.title ||
                            "Untitled incident"}
                        </h3>

                      </div>

                      <p className="text-xs text-slate-600 mt-1 font-mono truncate">
                        {incident._id ||
                          "Unknown ID"}
                      </p>

                    </div>

                    {/* SEVERITY */}

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase ${
                        severityStyles[
                          severity
                        ] ||
                        "bg-slate-500/20 text-slate-400 border-slate-500/20"
                      }`}
                    >
                      {formatValue(
                        incident.severity
                      )}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    {/* CATEGORY */}

                    <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                      {formatValue(
                        incident.category
                      )}
                    </span>

                    {/* STATUS */}

                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        statusStyles[
                          status
                        ] ||
                        "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {formatValue(
                        incident.status
                      )}
                    </span>

                    {/* DATE */}

                    <span className="text-xs text-slate-600">
                      {formatDate(
                        incident.createdAt
                      )}
                    </span>

                  </div>

                  {/* AI SECTION */}

                  <div className="mt-4 border-t border-slate-800 pt-4">

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10">

                          <Brain
                            size={15}
                            className="text-cyan-400"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-medium text-slate-300">
                            AI Investigation
                          </p>

                          <p className="text-[11px] text-slate-600">
                            {aiCompleted
                              ? "Gemini analysis completed"
                              : "No AI analysis yet"}
                          </p>

                        </div>

                      </div>

                      {/* RISK SCORE */}

                      {riskScore !== null ? (

                        <div
                          className={`rounded-lg px-3 py-1.5 ${riskStyle.bg}`}
                        >

                          <span className="text-[10px] uppercase tracking-wide text-slate-500 mr-2">
                            Risk
                          </span>

                          <span
                            className={`text-sm font-bold ${riskStyle.text}`}
                          >
                            {riskScore}/100
                          </span>

                        </div>

                      ) : (

                        <span className="text-xs text-slate-600">
                          Not investigated
                        </span>

                      )}

                    </div>

                    {/* THREAT TYPE */}

                    {aiCompleted &&
                      ai?.threatType && (
                        <div className="mt-3">

                          <span className="text-[10px] uppercase tracking-wide text-slate-600">
                            Threat Type
                          </span>

                          <p className="text-sm text-slate-300 mt-0.5">
                            {ai.threatType}
                          </p>

                        </div>
                      )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}
