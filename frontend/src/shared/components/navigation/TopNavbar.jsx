import {
  Search,
  Bell,
  Settings,
  UserCircle,
} from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8">

      <div>
        <h1 className="text-2xl font-bold text-white">
          Command Center
        </h1>

        <p className="text-slate-400 text-sm">
          Monitor your cybersecurity posture in real time
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">

          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white ml-3 w-56"
          />

        </div>

        <button className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800">
          <Bell className="text-white" size={20}/>
        </button>

        <button className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800">
          <Settings className="text-white" size={20}/>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold">
          <UserCircle size={22}/>
          Admin
        </button>

      </div>

    </header>
  );
}