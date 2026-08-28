import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <TopNavbar />

        <h1>SentinelAI Command Center</h1>

      </main>
    </div>
  );
}