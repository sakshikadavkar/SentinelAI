import { useEffect, useState } from "react";

import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Server,
} from "lucide-react";

import InfoCard from "../../shared/components/cards/InfoCard";

import ThreatActivityChart from "./components/ThreatActivityChart";
import ThreatSeverityChart from "./components/ThreatSeverityChart";
import RecentIncidents from "./components/RecentIncidents";
import AICopilot from "./components/AICopilot";
import LiveThreatFeed from "./components/LiveThreatFeed";

import { getDashboardStats } from "./services/dashboardService";

/*
|--------------------------------------------------------------------------
| Get Risk Level
|--------------------------------------------------------------------------
*/

const getRiskLevel = (score) => {
  if (score >= 81) {
    return "Critical";
  }

  if (score >= 61) {
    return "High";
  }

  if (score >= 31) {
    return "Moderate";
  }

  return "Low";
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeThreats: 0,
    aiInvestigated: 0,
    aiRiskScore: 0,
  });

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load Dashboard Statistics
  |--------------------------------------------------------------------------
  */

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const data = await getDashboardStats();

      console.log("📊 Dashboard statistics:", data);

      setStats({
        totalIncidents: data?.totalIncidents ?? 0,
        activeThreats: data?.activeThreats ?? 0,
        aiInvestigated: data?.aiInvestigated ?? 0,
        aiRiskScore: data?.aiRiskScore ?? 0,
      });
    } catch (error) {
      console.error(
        "❌ Failed to load dashboard statistics:",
        error
      );
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
    loadDashboardStats();

    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Risk Level
  |--------------------------------------------------------------------------
  */

  const riskLevel = getRiskLevel(stats.aiRiskScore);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          AI Cybersecurity Incident Response
        </h1>

        <p className="mt-2 text-slate-400">
          Real-time Security Operations Center
        </p>
      </div>


      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* AI RISK SCORE */}

        <InfoCard
          title="AI Risk Score"
          value={loading ? "—" : stats.aiRiskScore}
          suffix="/100"
          color="text-orange-400"
          subtitle={
            stats.aiInvestigated > 0
              ? "Based on investigated incidents"
              : "No AI investigations yet"
          }
          icon={ShieldAlert}
          progress={loading ? null : stats.aiRiskScore}
          riskLevel={loading ? null : riskLevel}
        />


        {/* ACTIVE THREATS */}

        <InfoCard
          title="Active Threats"
          value={loading ? "—" : stats.activeThreats}
          color="text-orange-400"
          subtitle="High & Critical severity"
          icon={Activity}
        />


        {/* AI INVESTIGATED */}

        <InfoCard
          title="AI Investigated"
          value={loading ? "—" : stats.aiInvestigated}
          color="text-green-400"
          subtitle="AI analysis available"
          icon={ShieldCheck}
        />


        {/* TOTAL INCIDENTS */}

        <InfoCard
          title="Total Incidents"
          value={loading ? "—" : stats.totalIncidents}
          color="text-cyan-400"
          subtitle="Recorded in MongoDB"
          icon={Server}
        />

      </div>


      {/* THREAT ACTIVITY + THREAT SEVERITY */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <ThreatActivityChart />
        </div>

        <ThreatSeverityChart />

      </div>


      {/* RECENT INCIDENTS + AI COPILOT */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <RecentIncidents />

        <AICopilot />

      </div>


      {/* LIVE THREAT FEED */}

      <LiveThreatFeed />

    </div>
  );
}