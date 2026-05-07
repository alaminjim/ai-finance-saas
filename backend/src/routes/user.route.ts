import { Router } from "express";
import {
  getCurrentUserController,
  updateUserController,
} from "../controllers/user.controller";
import { upload } from "../config/cloudinary.config";

const userRoutes = Router();

userRoutes.get("/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put(
  "/update",
  upload.single("profilePicture"),
  updateUserController
);

export default userRoutes;
