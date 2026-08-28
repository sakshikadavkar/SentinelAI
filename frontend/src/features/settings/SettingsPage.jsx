import { Settings, ShieldCheck, UserCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Settings size={32} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="mt-2 text-slate-400">Account and local environment status for SentinelAI.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-3">
            <UserCircle size={24} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Profile</h2>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="mt-1 text-white">{user?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="mt-1 text-white">{user?.email || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">Role</p>
              <p className="mt-1 capitalize text-white">{user?.role || "user"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Security Configuration</h2>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            {["JWT authentication", "MongoDB persistence", "Gemini AI investigation", "VirusTotal threat intelligence"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4">
                <span className="text-slate-300">{item}</span>
                <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  Configured on backend
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
