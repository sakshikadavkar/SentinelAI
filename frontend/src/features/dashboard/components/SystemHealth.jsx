export default function SystemHealth() {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800">
      <h3 className="text-slate-400">
        System Health
      </h3>

      <h1 className="text-5xl font-bold text-green-400 mt-5">
        98%
      </h1>

      <p className="text-slate-500 mt-4">
        All services operational
      </p>
    </div>
  );
}