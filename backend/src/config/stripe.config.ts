import Stripe from 'stripe';
import { Env } from './env.config';

export const stripe = new Stripe(Env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Premium Monthly',
    price: 999, // $9.99 in cents
    interval: 'month',
    features: [
      'Unlimited transactions',
      'Advanced analytics',
      'AI-powered insights',
      'Priority support',
      'Export data',
    ],
  },
  LIFETIME: {
    name: 'Premium Lifetime',
    price: 9999, // $99.99 in cents
    interval: 'month', // Use month for lifetime but set one-time payment mode
    features: [
      'Lifetime access to all features',
      'Unlimited transactions',
      'Advanced analytics',
      'AI-powered insights',
      'Priority support',
      'Export data',
      'All future updates',
    ],
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
