import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { getIncidents } from "../../../services/incidentService";

/*
|--------------------------------------------------------------------------
| Get Last 7 Days
|--------------------------------------------------------------------------
*/

const getLastSevenDays = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    days.push(date);
  }

  return days;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function ThreatActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load Threat Activity
  |--------------------------------------------------------------------------
  */

  const loadThreatActivity = async () => {
    try {
      setLoading(true);

      const response = await getIncidents();

      const incidents = Array.isArray(response?.incidents)
        ? response.incidents
        : [];

      const lastSevenDays = getLastSevenDays();

      /*
      |--------------------------------------------------------------------------
      | Build Chart Data
      |--------------------------------------------------------------------------
      */

      const chartData = lastSevenDays.map((date) => {
        const nextDate = new Date(date);

        nextDate.setDate(nextDate.getDate() + 1);

        const dayIncidents = incidents.filter((incident) => {
          if (!incident?.createdAt) {
            return false;
          }

          const createdAt = new Date(incident.createdAt);

          if (Number.isNaN(createdAt.getTime())) {
            return false;
          }

          return createdAt >= date && createdAt < nextDate;
        });

        return {
          day: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),

          fullDate: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),

          threats: dayIncidents.length,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error(
        "❌ Failed to load threat activity:",
        error
      );

      setData([]);
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
    loadThreatActivity();

    const interval = setInterval(() => {
      loadThreatActivity();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Tooltip
  |--------------------------------------------------------------------------
  */

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const item = payload[0]?.payload;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-500">
          {item?.fullDate}
        </p>

        <p className="mt-1 text-sm font-semibold text-cyan-400">
          {item?.threats ?? 0} incidents
        </p>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-xl font-semibold text-white">
            Threat Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Incidents recorded over the last 7 days
          </p>
        </div>

        {/* LIVE INDICATOR */}

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

      {/* CHART */}

      <div className="h-80">

        {loading ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-sm text-slate-500">
              Loading threat activity...
            </div>

          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">

            <p className="text-sm font-medium text-slate-400">
              No incident data available
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Create an incident to begin monitoring activity.
            </p>

          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#64748b"
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#334155",
                  strokeDasharray: "4 4",
                }}
              />

              <Line
                type="monotone"
                dataKey="threats"
                name="Incidents"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#06B6D4",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 3,
                  stroke: "#0f172a",
                }}
                animationDuration={800}
              />

            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

    </div>
  );
}
