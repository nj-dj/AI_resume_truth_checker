import { Router } from "express";

import { createResumeAnalysis } from "../controllers/resume.controller.js";
import { uploadResume } from "../middlewares/upload.middleware.js";
import { resumeRoutes } from "./resume.routes.js";

export const apiRouter = Router();

apiRouter.use("/resumes", resumeRoutes);
apiRouter.post("/upload-resume", uploadResume.single("resume"), createResumeAnalysis);
apiRouter.post("/analyze-candidate", uploadResume.single("resume"), createResumeAnalysis);
