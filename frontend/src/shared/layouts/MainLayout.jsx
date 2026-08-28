import Sidebar from "../components/navigation/Sidebar";
import TopNavbar from "../components/navigation/TopNavbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <TopNavbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}