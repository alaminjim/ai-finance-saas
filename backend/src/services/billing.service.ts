import Stripe from 'stripe';
import { stripe, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../config/stripe.config';
import SubscriptionModel from '../models/subscription.model';
import UserModel from '../models/user.model';

export class BillingService {
  static async createPaymentSession(plan: SubscriptionPlan, userId: string) {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

    if (!process.env.FRONTEND_ORIGIN) {
      throw new Error('Frontend origin is not configured');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    try {
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await UserModel.findByIdAndUpdate(userId, {
          stripeCustomerId: customerId,
        });
      }
    } catch (stripeError: any) {
      console.error('Stripe customer creation error:', stripeError);
      throw new Error(`Failed to create Stripe customer: ${stripeError.message}`);
    }

    const planConfig = SUBSCRIPTION_PLANS[plan];

    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    try {
      if (plan === 'LIFETIME') {
        // One-time payment for lifetime
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: planConfig.name,
                  description: planConfig.features.join(', '),
                },
                unit_amount: planConfig.price,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_ORIGIN}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_ORIGIN}/settings/billing?cancelled=true`,
          metadata: {
            userId,
            plan,
          },
        });

        return session;
      } else {
        // Monthly subscription
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: planConfig.name,
                  description: planConfig.features.join(', '),
                },
                unit_amount: planConfig.price,
                recurring: {
                  interval: planConfig.interval,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.FRONTEND_ORIGIN}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_ORIGIN}/settings/billing?cancelled=true`,
          metadata: {
            userId,
            plan,
          },
        });

        return session;
      }
    } catch (stripeError: any) {
      console.error('Stripe session creation error:', stripeError);
      throw new Error(`Failed to create payment session: ${stripeError.message}`);
    }
  }

  static async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan;

    if (!userId || !plan) {
      throw new Error('Invalid session metadata');
    }

    // Update user to premium
    await UserModel.findByIdAndUpdate(userId, {
      isPremium: true,
    });

    // Create or update subscription
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId },
      {
        plan,
        status: 'active',
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        currentPeriodEnd: plan === 'MONTHLY' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
      },
      { upsert: true, new: true }
    );

    return subscription;
  }

  static async getUserSubscription(userId: string) {
    const subscription = await SubscriptionModel.findOne({ userId }).populate('userId');
    return subscription;
  }

  static async cancelSubscription(userId: string) {
    const subscription = await SubscriptionModel.findOne({ userId });
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Update user premium status
    await UserModel.findByIdAndUpdate(userId, {
      isPremium: false,
    });

    return subscription;
  }

  static async checkSubscriptionStatus(userId: string) {
    const subscription = await SubscriptionModel.findOne({ userId });
    return subscription?.isActive() || false;
  }
}
