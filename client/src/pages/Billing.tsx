import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useCreatePaymentSessionMutation, useGetSubscriptionQuery } from "@/features/billing/billingAPI";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Billing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'LIFETIME' | null>(null);
  
  const { data: subscription, isLoading } = useGetSubscriptionQuery();
  const [createPaymentSession, { isLoading: isCreatingSession }] = useCreatePaymentSessionMutation();

  const plans = [
    {
      id: 'MONTHLY' as const,
      name: 'Premium Monthly',
      price: '$9.99',
      description: 'Perfect for getting started',
      features: [
        'Unlimited transactions',
        'Advanced analytics',
        'AI-powered insights',
        'Priority support',
        'Export data',
      ],
      icon: Zap,
      popular: true,
    },
    {
      id: 'LIFETIME' as const,
      name: 'Premium Lifetime',
      price: '$99.99',
      description: 'Best value for power users',
      features: [
        'Lifetime access to all features',
        'Unlimited transactions',
        'Advanced analytics',
        'AI-powered insights',
        'Priority support',
        'Export data',
        'All future updates',
      ],
      icon: Crown,
      popular: false,
    },
  ];

  const handleSubscribe = async (plan: 'MONTHLY' | 'LIFETIME') => {
    try {
      const result = await createPaymentSession({ plan }).unwrap();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe && result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to create payment session");
    }
  };

  const isSubscribed = subscription?.isActive;
  const currentPlan = subscription?.plan;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Upgrade to Premium
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features to take your financial management to the next level
        </p>
      </div>

      {isSubscribed && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-lg">You're a Premium User!</h3>
                    <p className="text-muted-foreground">
                      Currently subscribed to {currentPlan === 'LIFETIME' ? 'Lifetime' : 'Monthly'} plan
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = isSubscribed && currentPlan === plan.id;
          const isDisabled = isSubscribed && !isCurrentPlan;

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-yellow-200 shadow-lg' : ''} ${
                isCurrentPlan ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : ''
              } ${isDisabled ? 'opacity-60' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${plan.popular ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-yellow-600' : 'text-gray-600'}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.id === 'MONTHLY' && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isDisabled || isCreatingSession || isLoading}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isCreatingSession ? "Processing..." : isDisabled ? "Already Subscribed" : "Subscribe Now"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          All plans include a 30-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
};

export default Billing;
