import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";

import { getIncidents } from "../../services/incidentService";

export default function ReportsPage() {
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
      setError(err.response?.data?.message || "Unable to load report data.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const report = useMemo(() => {
    const open = incidents.filter((incident) => incident.status === "open").length;
    const investigating = incidents.filter((incident) => incident.status === "investigating").length;
    const resolved = incidents.filter((incident) => incident.status === "resolved").length;
    const critical = incidents.filter((incident) => incident.severity === "critical").length;
    const investigated = incidents.filter((incident) => incident.aiInvestigation?.status === "completed").length;

    return { open, investigating, resolved, critical, investigated };
  }, [incidents]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText size={32} className="text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Reports</h1>
          </div>
          <p className="mt-2 text-slate-400">A concise incident-response summary for review and submission demos.</p>
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">Incident Response Summary</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          {[
            ["Total", incidents.length],
            ["Open", report.open],
            ["Investigating", report.investigating],
            ["Resolved", report.resolved],
            ["AI Investigated", report.investigated],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{loading ? "-" : value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-5 text-sm leading-7 text-slate-300">
          {loading
            ? "Generating report summary..."
            : `SentinelAI is tracking ${incidents.length} incident(s), including ${report.critical} critical case(s). ${report.open} remain open, ${report.investigating} are under investigation, and ${report.resolved} are resolved. Gemini investigations have been completed for ${report.investigated} incident(s).`}
        </div>
      </div>
    </div>
  );
}
