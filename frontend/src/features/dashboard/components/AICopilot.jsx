import { useEffect, useState } from "react";

import {
  BrainCircuit,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getIncidents } from "../../../services/incidentService";

export default function AICopilot() {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load Latest AI Investigation
  |--------------------------------------------------------------------------
  */

  const loadLatestInvestigation = async () => {
    try {
      setLoading(true);

      const response = await getIncidents();

      const incidents = response?.incidents || [];

      /*
      |--------------------------------------------------------------------------
      | Find completed AI investigations
      |--------------------------------------------------------------------------
      */

      const investigatedIncidents = incidents
        .filter((item) => {
          const ai = item?.aiInvestigation;

          return (
            ai &&
            (
              ai.status === "completed" ||
              typeof ai.riskScore === "number"
            )
          );
        })
        .sort((a, b) => {
          const dateA = new Date(
            a.aiInvestigation?.investigatedAt ||
              a.updatedAt ||
              a.createdAt
          );

          const dateB = new Date(
            b.aiInvestigation?.investigatedAt ||
              b.updatedAt ||
              b.createdAt
          );

          return dateB - dateA;
        });

      /*
      |--------------------------------------------------------------------------
      | Set Latest Investigation
      |--------------------------------------------------------------------------
      */

      if (investigatedIncidents.length > 0) {
        setIncident(investigatedIncidents[0]);
      } else {
        setIncident(null);
      }

    } catch (error) {
      console.error(
        "❌ Failed to load AI Copilot data:",
        error
      );

      setIncident(null);
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
    loadLatestInvestigation();

    const interval = setInterval(() => {
      loadLatestInvestigation();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | AI Data
  |--------------------------------------------------------------------------
  */

  const ai = incident?.aiInvestigation;


  /*
  |--------------------------------------------------------------------------
  | Recommended Actions
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Key Findings
  |--------------------------------------------------------------------------
  */

  const keyFindings =
    ai?.keyFindings || [];


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


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <BrainCircuit
            className="text-cyan-400"
            size={24}
          />

          <div>

            <h2 className="text-xl font-semibold text-white">
              AI Copilot
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Latest Gemini investigation
            </p>

          </div>

        </div>


        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={loadLatestInvestigation}
            disabled={loading}
            className="text-slate-500 hover:text-cyan-400 transition disabled:opacity-50"
            title="Refresh AI investigation"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

          </button>


          {incident && (
            <CheckCircle2
              size={20}
              className="text-green-400"
            />
          )}

        </div>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="flex items-center justify-center py-10">

          <div className="flex items-center gap-3 text-slate-400">

            <Loader2
              size={20}
              className="animate-spin text-cyan-400"
            />

            Loading AI analysis...

          </div>

        </div>

      )}


      {/* NO INVESTIGATION */}

      {!loading && !incident && (

        <div className="py-8 text-center">

          <BrainCircuit
            size={42}
            className="mx-auto text-slate-700"
          />

          <h3 className="text-white font-semibold mt-4">
            No AI investigation yet
          </h3>

          <p className="text-slate-500 text-sm mt-2 leading-6">
            Run an AI investigation on an incident
            to see Gemini's analysis here.
          </p>

        </div>

      )}


      {/* REAL AI INVESTIGATION */}

      {!loading && incident && ai && (

        <div className="space-y-5">

          {/* INCIDENT */}

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Incident
            </p>

            <p className="text-white font-semibold mt-2">
              {incident.title || "Untitled incident"}
            </p>


            <div className="flex flex-wrap gap-2 mt-3">

              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                {ai.threatType || "Unknown threat"}
              </span>


              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs capitalize">
                {incident.severity || "Unknown"}
              </span>

            </div>

          </div>


          {/* AI ASSESSMENT */}

          <div>

            <div className="flex items-center gap-2 mb-2">

              <ShieldAlert
                size={18}
                className="text-cyan-400"
              />

              <p className="text-sm font-semibold text-white">
                AI Assessment
              </p>

            </div>


            <p className="text-slate-300 text-sm leading-6">

              {ai.analysis ||
                ai.threatAssessment ||
                "No assessment available."}

            </p>

          </div>


          {/* RISK + CONFIDENCE */}

          <div className="grid grid-cols-2 gap-3">

            {/* RISK */}

            <div className="bg-slate-800/60 rounded-xl p-4">

              <p className="text-xs text-slate-500">
                Risk Score
              </p>


              <p
                className={`text-2xl font-bold mt-1 ${getRiskColor(
                  ai.riskScore || 0
                )}`}
              >

                {typeof ai.riskScore === "number"
                  ? ai.riskScore
                  : "N/A"}

                {typeof ai.riskScore === "number" && (

                  <span className="text-xs text-slate-500 ml-1">
                    /100
                  </span>

                )}

              </p>

            </div>


            {/* CONFIDENCE */}

            <div className="bg-slate-800/60 rounded-xl p-4">

              <p className="text-xs text-slate-500">
                Confidence
              </p>


              <p className="text-lg font-semibold text-green-400 mt-2">

                {ai.confidenceLevel ||
                  ai.confidence ||
                  "Unknown"}

              </p>

            </div>

          </div>


          {/* KEY FINDINGS */}

          {Array.isArray(keyFindings) &&
            keyFindings.length > 0 && (

            <div>

              <p className="text-sm font-semibold text-white mb-3">
                Key Findings
              </p>


              <div className="space-y-2">

                {keyFindings
                  .slice(0, 3)
                  .map((finding, index) => (

                    <div
                      key={index}
                      className="flex gap-3"
                    >

                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs shrink-0">
                        {index + 1}
                      </span>


                      <p className="text-slate-400 text-sm leading-5">
                        {finding}
                      </p>

                    </div>

                  ))}

              </div>

            </div>

          )}


          {/* RECOMMENDED RESPONSE */}

          {Array.isArray(ai.recommendedActions) &&
  ai.recommendedActions.length > 0 && (
            <div>

              <p className="text-sm font-semibold text-white mb-3">
                Recommended Response
              </p>


              <div className="space-y-2">

                {ai.recommendedActions
  .slice(0, 3)
                  .map((action, index) => (

                    <div
                      key={index}
                      className="flex gap-3"
                    >

                      <span className="text-green-400 text-sm">
                        ✓
                      </span>


                      <p className="text-slate-400 text-sm leading-5">
                        {action}
                      </p>

                    </div>

                  ))}

              </div>

            </div>

          )}


          {/* INVESTIGATION TIME */}

          {ai.investigatedAt && (

            <div className="pt-3 border-t border-slate-800">

              <p className="text-xs text-slate-600">

                Investigated{" "}

                {new Date(
                  ai.investigatedAt
                ).toLocaleString()}

              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
}
