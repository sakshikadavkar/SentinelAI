import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, BarChart3, RefreshCw } from "lucide-react";

import { getIncidents } from "../../services/incidentService";

export default function AnalyticsPage() {
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
      setError(err.response?.data?.message || "Unable to load analytics.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const analytics = useMemo(() => {
    const status = { open: 0, investigating: 0, resolved: 0 };
    const severity = { critical: 0, high: 0, medium: 0, low: 0 };
    let riskTotal = 0;
    let riskCount = 0;

    incidents.forEach((incident) => {
      if (status[incident.status] !== undefined) status[incident.status] += 1;
      if (severity[incident.severity] !== undefined) severity[incident.severity] += 1;

      const score = incident.aiInvestigation?.riskScore;
      if (typeof score === "number") {
        riskTotal += score;
        riskCount += 1;
      }
    });

    return {
      status,
      severity,
      averageRisk: riskCount ? Math.round(riskTotal / riskCount) : 0,
      investigated: riskCount,
    };
  }, [incidents]);

  const statusCards = [
    ["Open", analytics.status.open, "text-yellow-400"],
    ["Investigating", analytics.status.investigating, "text-cyan-400"],
    ["Resolved", analytics.status.resolved, "text-green-400"],
    ["Average AI Risk", `${analytics.averageRisk}/100`, "text-orange-400"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
          </div>
          <p className="mt-2 text-slate-400">Operational metrics derived from your incident database.</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {statusCards.map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-3 text-3xl font-bold ${color}`}>{loading ? "-" : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <Activity size={22} className="text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Severity Distribution</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {Object.entries(analytics.severity).map(([severity, count]) => (
            <div key={severity} className="rounded-xl bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="capitalize text-slate-300">{severity}</span>
                <span className="font-semibold text-white">{loading ? "-" : count}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${incidents.length ? Math.round((count / incidents.length) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
