export default function ThreatLevelCard() {
  return (
    <div className="rounded-2xl border border-red-500 bg-[#111827] p-6">
      <h2 className="text-gray-400">Threat Level</h2>

      <h1 className="text-5xl font-bold text-red-500 mt-4">
        HIGH
      </h1>

      <p className="text-slate-400 mt-4">
        12 Active Critical Threats
      </p>
    </div>
  );
}