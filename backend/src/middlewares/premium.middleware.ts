import { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "./asyncHandler.middlerware";

export const requirePremium = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const isPremium = await BillingService.checkSubscriptionStatus(userId);

    if (!isPremium) {
      return res.status(HTTPSTATUS.PAYMENT_REQUIRED).json({
        message: "Premium subscription required to access this feature",
        code: "PREMIUM_REQUIRED",
      });
    }

    next();
  }
);
