import { Router } from "express";
import {
  loginController,
  registerController,
  googleAuthUrlController,
  googleAuthCallbackController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/google/url", googleAuthUrlController);
authRoutes.post("/google/callback", googleAuthCallbackController);

export default authRoutes;
