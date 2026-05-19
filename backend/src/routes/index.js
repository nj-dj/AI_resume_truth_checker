import { Router } from "express";

import { createResumeAnalysis } from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadResume } from "../middlewares/upload.middleware.js";
import { authRoutes } from "./auth.routes.js";
import { careerRoutes } from "./career.routes.js";
import { extensionRoutes } from "./extension.routes.js";
import { resumeRoutes } from "./resume.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/extension", extensionRoutes);
apiRouter.use(requireAuth);
apiRouter.use("/career", careerRoutes);
apiRouter.use("/resumes", resumeRoutes);
apiRouter.post("/upload-resume", uploadResume.single("resume"), createResumeAnalysis);
apiRouter.post("/analyze-candidate", uploadResume.single("resume"), createResumeAnalysis);
