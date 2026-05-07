import { Router } from "express";
import {
  createPaymentSessionController,
  getUserSubscriptionController,
  cancelSubscriptionController,
  stripeWebhookController,
} from "../controllers/billing.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const billingRoutes = Router();

// Protected routes (require authentication)
billingRoutes.post(
  "/create-payment-session",
  passportAuthenticateJwt,
  createPaymentSessionController
);

billingRoutes.get(
  "/subscription",
  passportAuthenticateJwt,
  getUserSubscriptionController
);

billingRoutes.post(
  "/cancel-subscription",
  passportAuthenticateJwt,
  cancelSubscriptionController
);

// Webhook route (no authentication required)
billingRoutes.post(
  "/webhook",
  stripeWebhookController
);

export default billingRoutes;
