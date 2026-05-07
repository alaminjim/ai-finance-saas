import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import { BillingService } from "../services/billing.service";
import { SubscriptionPlan } from "../config/stripe.config";

export const createPaymentSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { plan } = req.body as { plan: SubscriptionPlan };
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    if (!plan || !['MONTHLY', 'LIFETIME'].includes(plan)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Invalid plan selected",
      });
    }

    const session = await BillingService.createPaymentSession(plan, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Payment session created successfully",
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  }
);

export const getUserSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const subscription = await BillingService.getUserSubscription(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription retrieved successfully",
      data: subscription,
    });
  }
);

export const cancelSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const subscription = await BillingService.cancelSubscription(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  }
);

export const stripeWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Webhook secret not configured",
      });
    }

    let event: any;

    try {
      event = require('stripe')(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.log('Webhook signature verification failed.', err.message);
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: `Webhook Error: ${err.message}`,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await BillingService.handleSuccessfulPayment(session);
        break;
      case 'invoice.payment_succeeded':
        // Handle recurring payment success
        break;
      case 'invoice.payment_failed':
        // Handle payment failure
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
);
