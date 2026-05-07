import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middlerware";
import connctDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import { initializeCrons } from "./cron";
import reportRoutes from "./routes/report.route";
import analyticsRoutes from "./routes/analytics.route";
import billingRoutes from "./routes/billing.route";
import { requirePremium } from "./middlewares/premium.middleware";
import { Env } from "./config/env.config";

const app = express();
const BASE_PATH = process.env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

const allowedOrigins: string[] = [
  process.env.FRONTEND_ORIGIN || "",
  "https://ai-finance-saas-client.onrender.com",
  "https://ai-finance-saas-d1df6b.netlify.app",
].filter(origin => origin !== "");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "api is working",
    });
  })
);

// Test endpoint without authentication
app.get(`${BASE_PATH}/user/test`, (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/billing`, billingRoutes);

app.use(errorHandler);


const startServer = async () => {
  try {
    await connctDatabase(); // wait for DB connection

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "production"
    ) {
      await initializeCrons();
    }

    if (!process.env.VERCEL) {
      app.listen(Env.PORT, () => {
        console.log(
          `Server is running on port ${Env.PORT} in ${process.env.NODE_ENV} mode`
        );
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

// Export the app for Vercel
export default app;
