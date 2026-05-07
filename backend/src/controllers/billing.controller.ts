import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import { BillingService } from "../services/billing.service";
import { SubscriptionPlan } from "../config/stripe.config";

export const createPaymentSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
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
    } catch (error: any) {
      console.error('Payment session creation error:', error);
      
      // Don't expose sensitive error details to client
      const errorMessage = error.message.includes('Stripe') || 
                        error.message.includes('configured') ||
                        error.message.includes('Invalid plan') 
                        ? error.message 
                        : "Failed to create payment session";
      
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: errorMessage,
      });
    }
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

export const paymentSuccessController = asyncHandler(
  async (req: Request, res: Response) => {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Session ID is required",
      });
    }

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id as string);

      if (session.payment_status === 'paid') {
        await BillingService.handleSuccessfulPayment(session);
        
        return res.status(HTTPSTATUS.OK).json({
          message: "Payment successful, subscription activated",
          data: session,
        });
      } else {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Payment not completed",
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to verify payment",
      });
    }
  }
);
