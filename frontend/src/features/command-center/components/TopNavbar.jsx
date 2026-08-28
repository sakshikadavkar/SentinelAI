import { Bell, Search } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="top-navbar">
      <h2>Security Operations Center</h2>

      <div className="navbar-actions">
        <Search size={20} />
        <Bell size={20} />
      </div>
    </header>
  );
}