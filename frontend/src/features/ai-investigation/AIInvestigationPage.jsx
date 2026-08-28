import { useEffect, useState } from "react";
import { AlertCircle, BrainCircuit, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { getIncidents } from "../../services/incidentService";

export default function AIInvestigationPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getIncidents();
      setIncidents(Array.isArray(response?.incidents) ? response.incidents : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load AI investigations.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const investigated = incidents
    .filter((incident) => incident?.aiInvestigation?.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.aiInvestigation?.investigatedAt || b.updatedAt || 0) -
        new Date(a.aiInvestigation?.investigatedAt || a.updatedAt || 0)
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BrainCircuit size={32} className="text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">AI Investigation</h1>
          </div>
          <p className="mt-2 text-slate-400">
            Completed Gemini investigations with risk scoring and response guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadIncidents}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">
          Loading investigations...
        </div>
      ) : investigated.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
          <ShieldAlert size={42} className="mx-auto text-slate-700" />
          <h2 className="mt-4 text-xl font-semibold text-white">No completed investigations</h2>
          <p className="mt-2 text-slate-500">Open an incident and run the AI investigation workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {investigated.map((incident) => {
            const ai = incident.aiInvestigation || {};

            return (
              <Link
                to={`/incidents/${incident._id}`}
                key={incident._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white">{incident.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{ai.threatType || "Unknown threat"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Risk</p>
                    <p className="text-3xl font-bold text-cyan-400">{ai.riskScore ?? "N/A"}</p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                  {ai.analysis || "No assessment available."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-slate-800 px-3 py-1 text-slate-300">
                    Confidence: {ai.confidenceLevel || "Unknown"}
                  </span>
                  <span className="rounded-lg bg-slate-800 px-3 py-1 text-slate-300">
                    {ai.investigatedAt ? new Date(ai.investigatedAt).toLocaleString() : "Timestamp unavailable"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
