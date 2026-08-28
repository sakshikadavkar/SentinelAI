import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getIncidents } from "../../../services/incidentService";

const SEVERITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const normalizeSeverity = (severity) => {
  if (!severity) return null;

  const normalized = String(severity)
    .trim()
    .toLowerCase();

  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";

  return null;
};

export default function ThreatSeverityChart() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSeverityData = async () => {
    try {
      setLoading(true);

      const response = await getIncidents();

      const incidents = Array.isArray(
        response?.incidents
      )
        ? response.incidents
        : [];

      const counts = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
      };

      incidents.forEach((incident) => {
        const severity = normalizeSeverity(
          incident?.severity
        );

        if (severity) {
          counts[severity] += 1;
        }
      });

      const chartData = SEVERITIES
        .filter(
          (severity) =>
            counts[severity] > 0
        )
        .map((severity) => ({
          name: severity,
          value: counts[severity],
        }));

      setData(chartData);
      setTotal(incidents.length);
    } catch (error) {
      console.error(
        "❌ Failed to load threat severity:",
        error
      );

      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeverityData();

    const interval = setInterval(
      loadSeverityData,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getSeverityCount = (severity) => {
    return (
      data.find(
        (item) =>
          item.name === severity
      )?.value || 0
    );
  };

  const CustomTooltip = ({
    active,
    payload,
  }) => {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const item = payload[0];

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-500">
          Incident Severity
        </p>

        <p
          className="mt-1 text-sm font-semibold"
          style={{
            color: COLORS[item.name],
          }}
        >
          {item.name}
        </p>

        <p className="mt-1 text-sm text-white">
          {item.value} incident
          {item.value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">

      {/* HEADER */}

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Threat Severity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Severity distribution of recorded incidents
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>

          <span className="text-xs font-medium text-slate-400">
            Live
          </span>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex h-80 items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading severity data...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && total === 0 && (
        <div className="flex h-80 flex-col items-center justify-center">
          <p className="text-sm font-medium text-slate-400">
            No incidents recorded
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Create an incident to see severity data.
          </p>
        </div>
      )}

      {/* CHART */}

      {!loading && total > 0 && (
        <>
          <div className="h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="#0f172a"
                  strokeWidth={2}
                  labelLine={false}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={<CustomTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CENTER TOTAL */}

          <div className="relative -mt-40 mb-24 flex justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {total}
              </p>

              <p className="text-xs text-slate-500">
                Incidents
              </p>
            </div>
          </div>

          {/* LEGEND */}

          <div className="grid grid-cols-2 gap-3">
            {SEVERITIES.map((severity) => {
              const count =
                getSeverityCount(severity);

              return (
                <div
                  key={severity}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[severity],
                      }}
                    />

                    <span className="text-sm text-slate-300">
                      {severity}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-white">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
