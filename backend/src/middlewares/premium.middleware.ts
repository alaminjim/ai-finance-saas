import { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "./asyncHandler.middlerware";
import UserModel from "../models/user.model";

export const requirePremium = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const isPremium = await BillingService.checkSubscriptionStatus(userId);
    
    // Check if user is on trial
    const user = await UserModel.findById(userId);
    const isOnTrial = user?.isOnTrial() || false;

    if (!isPremium && !isOnTrial) {
      return res.status(HTTPSTATUS.PAYMENT_REQUIRED).json({
        message: "Premium subscription required to access this feature",
        code: "PREMIUM_REQUIRED",
      });
    }

    next();
  }
);
