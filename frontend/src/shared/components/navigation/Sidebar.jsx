import {
  LayoutDashboard,
  ShieldAlert,
  BrainCircuit,
  Globe,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

const menuItems = [
  {
    title: "Command Center",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Incidents",
    icon: ShieldAlert,
    path: "/incidents",
  },
  {
    title: "Threat Intelligence",
    icon: Globe,
    path: "/threat-intelligence",
  },
  {
    title: "AI Investigation",
    icon: BrainCircuit,
    path: "/ai-investigation",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-8 py-8 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-white">
          Sentinel
          <span className="text-cyan-400">AI</span>
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          AI Incident Response Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 mb-3 transition-all ${
                active
                  ? "bg-cyan-500 text-black font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          {user && (
            <>
              <p className="text-white font-semibold truncate">
                {user.name}
              </p>

              <p className="text-slate-500 text-xs truncate mt-1">
                {user.email}
              </p>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-3 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Security Status */}
      <div className="p-6 border-t border-slate-800">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-xs text-slate-400">
            Security Status
          </p>

          <h3 className="text-green-400 font-bold mt-2">
            All Systems Operational
          </h3>
        </div>
      </div>
    </aside>
  );
}