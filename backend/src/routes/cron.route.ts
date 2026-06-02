import { Router, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { processRecurringTransactions } from "../cron/jobs/transaction.job";
import { processReportJob } from "../cron/jobs/report.job";

const cronRoutes = Router();

cronRoutes.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. Verify Vercel Cron Secret (Authorization: Bearer <CRON_SECRET>)
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // In production, require the token. In development, allow bypass if CRON_SECRET is not configured or for testing.
    if (process.env.NODE_ENV === "production" || cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid or missing Vercel Cron Secret.",
        });
      }
    }

    const { job } = req.query;

    if (job === "transactions") {
      console.log("⚡ Vercel Cron: Starting recurring transactions processing...");
      const result = await processRecurringTransactions();
      return res.status(200).json({
        success: true,
        message: "Recurring transactions processed successfully.",
        result,
      });
    } else if (job === "reports") {
      console.log("⚡ Vercel Cron: Starting recurring reports processing...");
      const result = await processReportJob();
      return res.status(200).json({
        success: true,
        message: "Recurring reports processed successfully.",
        result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing job query parameter. Use 'transactions' or 'reports'.",
      });
    }
  })
);

export default cronRoutes;
