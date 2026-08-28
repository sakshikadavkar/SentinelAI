import { useEffect, useState } from "react";

import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getIncidents } from "../../../services/incidentService";


/*
|--------------------------------------------------------------------------
| Incident Icon
|--------------------------------------------------------------------------
*/

const getIncidentIcon = (severity, status) => {
  const normalizedSeverity =
    String(severity || "").toLowerCase();

  const normalizedStatus =
    String(status || "").toLowerCase();

  if (normalizedStatus === "resolved") {
    return ShieldCheck;
  }

  if (
    normalizedSeverity === "critical" ||
    normalizedSeverity === "high"
  ) {
    return ShieldAlert;
  }

  return Activity;
};


/*
|--------------------------------------------------------------------------
| Incident Color
|--------------------------------------------------------------------------
*/

const getIncidentColor = (severity, status) => {
  const normalizedSeverity =
    String(severity || "").toLowerCase();

  const normalizedStatus =
    String(status || "").toLowerCase();

  if (normalizedStatus === "resolved") {
    return "text-green-400";
  }

  switch (normalizedSeverity) {
    case "critical":
      return "text-red-500";

    case "high":
      return "text-orange-400";

    case "medium":
      return "text-yellow-400";

    case "low":
      return "text-green-400";

    default:
      return "text-cyan-400";
  }
};


/*
|--------------------------------------------------------------------------
| Relative Time
|--------------------------------------------------------------------------
*/

const formatTime = (date) => {
  if (!date) {
    return "Unknown time";
  }

  const createdAt = new Date(date);

  if (Number.isNaN(createdAt.getTime())) {
    return "Unknown time";
  }

  const now = new Date();

  const difference =
    now.getTime() - createdAt.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return createdAt.toLocaleDateString();
};


/*
|--------------------------------------------------------------------------
| Category Formatting
|--------------------------------------------------------------------------
*/

const formatCategory = (category) => {
  if (!category) {
    return "Security incident";
  }

  return String(category)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function LiveThreatFeed() {
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /*
  |--------------------------------------------------------------------------
  | Load Real Incidents
  |--------------------------------------------------------------------------
  */

  const loadThreatFeed = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await getIncidents();

      const realIncidents =
        response?.incidents || [];


      /*
      |--------------------------------------------------------------------------
      | Sort newest incidents first
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
      | Display latest 6
      |--------------------------------------------------------------------------
      */

      setIncidents(
        sortedIncidents.slice(0, 6)
      );

    } catch (err) {
      console.error(
        "❌ Failed to load live threat feed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load threat feed."
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
    loadThreatFeed();

    const interval = setInterval(() => {
      loadThreatFeed();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            Live Threat Feed
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest security incidents from MongoDB
          </p>

        </div>


        <div className="flex items-center gap-3">

          <span className="flex items-center gap-2 text-green-400 text-sm font-semibold">

            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            LIVE

          </span>


          <button
            type="button"
            onClick={loadThreatFeed}
            disabled={loading}
            className="text-slate-400 hover:text-cyan-400 transition disabled:opacity-50"
            title="Refresh threat feed"
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

      </div>


      {/* ERROR */}

      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-5">

          <AlertCircle
            size={18}
            className="text-red-400 shrink-0"
          />

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>

      )}


      {/* LOADING */}

      {loading && (

        <div className="py-10 text-center text-slate-500">
          Loading live threat feed...
        </div>

      )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        incidents.length === 0 && (

          <div className="py-10 text-center">

            <Activity
              size={42}
              className="mx-auto text-slate-700"
            />

            <p className="text-slate-400 mt-4">
              No security incidents recorded.
            </p>

            <p className="text-slate-600 text-sm mt-1">
              New incidents will appear here automatically.
            </p>

          </div>

        )}


      {/* REAL MONGODB INCIDENTS */}

      {!loading &&
        !error &&
        incidents.length > 0 && (

          <div className="space-y-5">

            {incidents.map((incident) => {

              const Icon =
                getIncidentIcon(
                  incident.severity,
                  incident.status
                );

              const iconColor =
                getIncidentColor(
                  incident.severity,
                  incident.status
                );


              return (

                <div
                  key={incident._id}
                  className="flex items-center gap-4 border-b border-slate-800 pb-4 last:border-b-0 last:pb-0"
                >

                  {/* ICON */}

                  <div className="bg-slate-800 p-3 rounded-xl shrink-0">

                    <Icon
                      size={22}
                      className={iconColor}
                    />

                  </div>


                  {/* INCIDENT */}

                  <div className="flex-1 min-w-0">

                    <p className="text-white font-medium truncate">
                      {incident.title ||
                        "Untitled incident"}
                    </p>


                    <div className="flex flex-wrap items-center gap-2 mt-1">

                      <span className="text-slate-500 text-sm">
                        {formatCategory(
                          incident.category
                        )}
                      </span>


                      <span className="text-slate-700">
                        •
                      </span>


                      <span
                        className={`text-xs font-semibold uppercase ${iconColor}`}
                      >
                        {incident.severity ||
                          "unknown"}
                      </span>


                      <span className="text-slate-700">
                        •
                      </span>


                      <span className="text-slate-500 text-xs capitalize">
                        {incident.status ||
                          "unknown"}
                      </span>

                    </div>

                  </div>


                  {/* TIME */}

                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {formatTime(
                      incident.createdAt
                    )}
                  </span>

                </div>

              );

            })}

          </div>

        )}

    </div>
  );
}
