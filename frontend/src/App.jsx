import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import TruthCheckerPage from "./features/truth-checker/TruthCheckerPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AtsScannerPage from "./pages/AtsScannerPage.jsx";
import CareerAssistantPage from "./pages/CareerAssistantPage.jsx";
import CoverLetterPage from "./pages/CoverLetterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InterviewPrepPage from "./pages/InterviewPrepPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import ResumeBuilderPage from "./pages/ResumeBuilderPage.jsx";
import ResumeEnhancePage from "./pages/ResumeEnhancePage.jsx";

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-on-surface">
        <div className="text-center">
          <span className="status-dot mx-auto block animate-pulse" />
          <p className="mt-4 font-code-md text-code-md uppercase text-on-surface-variant">Checking session</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<AuthPage mode="login" />} />
      <Route path="signup" element={<AuthPage mode="signup" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="truth-checker" element={<TruthCheckerPage />} />
          <Route path="ats" element={<AtsScannerPage />} />
          <Route path="enhance" element={<ResumeEnhancePage />} />
          <Route path="builder" element={<ResumeBuilderPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="cover-letter" element={<CoverLetterPage />} />
          <Route path="career" element={<CareerAssistantPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
