import { apiClient } from "@/app/api-client";

export type SubscriptionPlan = 'MONTHLY' | 'LIFETIME';

export interface PaymentSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentSessionApiResponse {
  message: string;
  data: PaymentSessionResponse;
}

export interface Subscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export const billingApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentSession: builder.mutation<PaymentSessionApiResponse, { plan: SubscriptionPlan }>({
      query: (data) => ({
        url: "/billing/create-payment-session",
        method: "POST",
        body: data,
      }),
    }),

    getSubscription: builder.query<Subscription, void>({
      query: () => ({
        url: "/billing/subscription",
        method: "GET",
      }),
    }),

    cancelSubscription: builder.mutation<Subscription, void>({
      query: () => ({
        url: "/billing/cancel-subscription",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useCreatePaymentSessionMutation,
  useGetSubscriptionQuery,
  useCancelSubscriptionMutation,
} = billingApi;
