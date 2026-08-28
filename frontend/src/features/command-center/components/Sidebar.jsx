import { Shield } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <Shield size={32} />
        <span>SentinelAI</span>
      </div>
    </aside>
  );
}