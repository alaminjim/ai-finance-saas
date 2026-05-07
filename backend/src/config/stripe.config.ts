import Stripe from 'stripe';
import { Env } from './env.config';

export const stripe = new Stripe(Env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
});

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Premium Monthly',
    price: 999, // $9.99 in cents
    interval: 'month' as const,
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
    interval: 'one_time' as const,
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
