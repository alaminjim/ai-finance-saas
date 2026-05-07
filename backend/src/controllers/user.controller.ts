import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  findByIdUserService,
  updateUserService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { updateUserSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("REQ.USER:", req.user); // Debug
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "User ID missing in request",
      });
    }

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Update user request:", {
      body: req.body,
      user: req.user,
      file: req.file,
    });

    if (!req.user?._id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const body = updateUserSchema.parse(req.body);
    const userId = req.user._id;
    const profilePic = req.file;

    console.log("Parsed data:", { userId, body, hasProfilePic: !!profilePic });

    const user = await updateUserService(userId, body, profilePic);

    return res.status(HTTPSTATUS.OK).json({
      message: "User profile updated successfully",
      data: user,
    });
  }
);
