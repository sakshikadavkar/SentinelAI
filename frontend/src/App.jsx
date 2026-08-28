import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./shared/layouts/MainLayout";
import ProtectedRoute from "./shared/routes/ProtectedRoute";

import Dashboard from "./features/dashboard/Dashboard";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import IncidentsPage from "./features/incidents/pages/IncidentsPage";
import IncidentDetails from "./features/incidents/IncidentDetails";
import ThreatIntelligencePage from "./features/threat-intelligence/ThreatIntelligencePage";
import AIInvestigationPage from "./features/ai-investigation/AIInvestigationPage";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import ReportsPage from "./features/reports/ReportsPage";
import SettingsPage from "./features/settings/SettingsPage";
import NotFoundPage from "./shared/pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />

          <Route
            path="/incidents"
            element={
              <MainLayout>
                <IncidentsPage />
              </MainLayout>
            }
          />

          <Route
            path="/incidents/:id"
            element={
              <MainLayout>
                <IncidentDetails />
              </MainLayout>
            }
          />

          <Route
            path="/threat-intelligence"
            element={
              <MainLayout>
                <ThreatIntelligencePage />
              </MainLayout>
            }
          />

          <Route
            path="/ai-investigation"
            element={
              <MainLayout>
                <AIInvestigationPage />
              </MainLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <MainLayout>
                <AnalyticsPage />
              </MainLayout>
            }
          />

          <Route
            path="/reports"
            element={
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            }
          />

          <Route
            path="/settings"
            element={
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            }
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
