import { Router } from "express";

import { createResumeAnalysis } from "../controllers/resume.controller.js";
import { uploadResume } from "../middlewares/upload.middleware.js";

export const resumeRoutes = Router();

resumeRoutes.post("/analyze", uploadResume.single("resume"), createResumeAnalysis);
