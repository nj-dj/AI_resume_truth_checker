import { Router } from "express";

import { login, refresh, signup } from "../controllers/auth.controller.js";
import {
  generateExtensionCoverLetter,
  getExtensionUsage,
  saveExtensionCoverLetter,
  trackExtensionEvent,
} from "../controllers/extension.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const extensionRoutes = Router();

extensionRoutes.post("/auth/signup", signup);
extensionRoutes.post("/auth/login", login);
extensionRoutes.post("/auth/refresh", refresh);
extensionRoutes.get("/usage", requireAuth, getExtensionUsage);
extensionRoutes.post("/cover-letters/generate", requireAuth, generateExtensionCoverLetter);
extensionRoutes.post("/cover-letters/save", requireAuth, saveExtensionCoverLetter);
extensionRoutes.post("/events", requireAuth, trackExtensionEvent);
