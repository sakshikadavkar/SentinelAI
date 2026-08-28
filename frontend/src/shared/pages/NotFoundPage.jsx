import { ShieldAlert, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <ShieldAlert size={28} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-white">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          The SentinelAI route you opened does not exist or is not available in this workspace.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
