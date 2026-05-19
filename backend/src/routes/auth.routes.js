import { Router } from "express";

import { login, logout, me, refresh, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);
