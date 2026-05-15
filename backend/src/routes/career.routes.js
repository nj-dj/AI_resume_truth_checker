import { Router } from "express";

import {
  postAtsScan,
  postAtsScanText,
  postCareerInsights,
  postCoverLetter,
  postInterviewFeedback,
  postInterviewSession,
  postJobRecommendations,
  postPortfolioHtml,
  postResumeEnhanceText,
  postResumeEnhanceUpload,
} from "../controllers/career.controller.js";
import { uploadResume } from "../middlewares/upload.middleware.js";

export const careerRoutes = Router();

careerRoutes.post("/ats-scan", uploadResume.single("resume"), postAtsScan);
careerRoutes.post("/ats-scan-text", postAtsScanText);
careerRoutes.post("/resume-enhance", uploadResume.single("resume"), postResumeEnhanceUpload);
careerRoutes.post("/resume-enhance-text", postResumeEnhanceText);
careerRoutes.post("/cover-letter", postCoverLetter);
careerRoutes.post("/career-insights", postCareerInsights);
careerRoutes.post("/job-recommendations", postJobRecommendations);
careerRoutes.post("/portfolio-html", postPortfolioHtml);
careerRoutes.post("/interview/session", postInterviewSession);
careerRoutes.post("/interview/feedback", postInterviewFeedback);
