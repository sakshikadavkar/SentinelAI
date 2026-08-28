import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Globe,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
} from "lucide-react";

import { getIncidents } from "../../services/incidentService";

const emptySummary = {
  total: 0,
  malicious: 0,
  suspicious: 0,
  clean: 0,
  unknown: 0,
};

const getVerdict = (item) => {
  const intel = item?.threatIntel || {};

  if (!intel.success) return "unknown";
  if (Number(intel.malicious || 0) > 0) return "malicious";
  if (Number(intel.suspicious || 0) > 0) return "suspicious";
  if (Number(intel.harmless || 0) > 0) return "clean";

  return "unknown";
};

const verdictStyles = {
  malicious: {
    label: "Malicious",
    icon: ShieldX,
    className: "border-red-500/25 bg-red-500/10 text-red-400",
  },
  suspicious: {
    label: "Suspicious",
    icon: ShieldAlert,
    className: "border-orange-500/25 bg-orange-500/10 text-orange-400",
  },
  clean: {
    label: "Harmless / Clean",
    icon: ShieldCheck,
    className: "border-green-500/25 bg-green-500/10 text-green-400",
  },
  unknown: {
    label: "Unknown",
    icon: ShieldQuestion,
    className: "border-slate-700 bg-slate-800/60 text-slate-400",
  },
};

export default function ThreatIntelligencePage() {
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
      setError(err.response?.data?.message || "Unable to load threat intelligence data.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const { summary, results } = useMemo(() => {
    const aggregate = { ...emptySummary };
    const items = [];

    incidents.forEach((incident) => {
      const threatIntel = incident?.threatIntelligence || {};
      const incidentSummary = threatIntel.summary || {};

      aggregate.total += Number(incidentSummary.total || 0);
      aggregate.malicious += Number(incidentSummary.malicious || 0);
      aggregate.suspicious += Number(incidentSummary.suspicious || 0);
      aggregate.clean += Number(incidentSummary.clean || 0);
      aggregate.unknown += Number(incidentSummary.unknown || 0);

      if (Array.isArray(threatIntel.results)) {
        threatIntel.results.forEach((result) => {
          items.push({
            ...result,
            incidentTitle: incident.title,
            incidentId: incident._id,
          });
        });
      }
    });

    return { summary: aggregate, results: items };
  }, [incidents]);

  const cards = [
    ["Total IOCs", summary.total, "text-white"],
    ["Malicious", summary.malicious, "text-red-400"],
    ["Suspicious", summary.suspicious, "text-orange-400"],
    ["Harmless / Clean", summary.clean, "text-green-400"],
    ["Unknown", summary.unknown, "text-slate-400"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Globe size={32} className="text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Threat Intelligence</h1>
          </div>
          <p className="mt-2 text-slate-400">
            VirusTotal enrichment for indicators detected during AI investigations.
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {cards.map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-3 text-3xl font-bold ${color}`}>{loading ? "-" : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">Indicator Results</h2>
        <p className="mt-1 text-sm text-slate-500">
          Results reflect provider data only. Unknown means no successful verdict was available.
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading threat intelligence...</div>
        ) : results.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
            Run an AI investigation on an incident with IOCs to populate this view.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            {results.map((item, index) => {
              const verdict = getVerdict(item);
              const style = verdictStyles[verdict];
              const Icon = style.icon;

              return (
                <div
                  key={`${item.value}-${index}`}
                  className="grid gap-4 border-b border-slate-800 bg-slate-950/35 p-4 last:border-b-0 lg:grid-cols-[1fr_180px_140px]"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-slate-200 break-all">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.type || "indicator"} from {item.incidentTitle || "Untitled incident"}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <span className="text-red-400">M {item.threatIntel?.malicious ?? 0}</span>
                    <span className="text-orange-400">S {item.threatIntel?.suspicious ?? 0}</span>
                    <span className="text-green-400">H {item.threatIntel?.harmless ?? 0}</span>
                    <span className="text-slate-400">U {item.threatIntel?.undetected ?? 0}</span>
                  </div>

                  <span className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${style.className}`}>
                    <Icon size={15} />
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
