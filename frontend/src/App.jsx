import { Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";
import TruthCheckerPage from "./features/truth-checker/TruthCheckerPage.jsx";
import AtsScannerPage from "./pages/AtsScannerPage.jsx";
import CareerAssistantPage from "./pages/CareerAssistantPage.jsx";
import CoverLetterPage from "./pages/CoverLetterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InterviewPrepPage from "./pages/InterviewPrepPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import ResumeBuilderPage from "./pages/ResumeBuilderPage.jsx";
import ResumeEnhancePage from "./pages/ResumeEnhancePage.jsx";

export default function App() {
  return (
    <Routes>
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
    </Routes>
  );
}
