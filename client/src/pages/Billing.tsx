import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { useCreatePaymentSessionMutation, useGetSubscriptionQuery } from "@/features/billing";
import { toast } from "sonner";

// Debug Stripe configuration
console.log('Stripe publishable key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Missing');
console.log('API URL:', import.meta.env.VITE_API_URL || "https://ai-finance-saas-th6o.onrender.com/api");

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'LIFETIME' | null>(null);
  
  const { data: subscription, isLoading, refetch } = useGetSubscriptionQuery();
  const [createPaymentSession, { isLoading: isCreatingSession }] = useCreatePaymentSessionMutation();

  // Handle payment success callback
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true' && sessionId) {
      console.log('Payment success detected, session_id:', sessionId);
      
      // Call payment success endpoint to activate subscription
      fetch(`${import.meta.env.VITE_API_URL || "https://ai-finance-saas-th6o.onrender.com/api"}/billing/payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          console.log('Payment success response:', data);
          if (data.message) {
            toast.success(data.message);
            // Force multiple refetch attempts to ensure data is updated
            refetch();
            setTimeout(() => refetch(), 1000);
            setTimeout(() => refetch(), 2000);
            // Show success message and update UI
            setTimeout(() => {
              toast.success("Your subscription is now active! 🎉");
              // Force page reload after 3 seconds to ensure all components update
              window.location.reload();
            }, 3000);
          }
        })
        .catch(error => {
          console.error('Payment verification error:', error);
          toast.error('Failed to verify payment');
        });
    } else if (cancelled === 'true') {
      toast.info('Payment was cancelled');
    }
  }, [searchParams, refetch]);

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
      console.log('Creating payment session for plan:', plan);
      const result = await createPaymentSession({ plan }).unwrap();
      console.log('Payment session created:', result);
      
      // Extract URL from the nested data object
      const sessionUrl = result.data?.url;
      console.log('Session URL:', sessionUrl);
      
      // Direct redirect to Stripe URL - no need to load Stripe.js for simple redirect
      if (sessionUrl) {
        console.log('Redirecting to Stripe:', sessionUrl);
        window.location.href = sessionUrl;
      } else {
        console.error('Missing session URL');
        toast.error("Payment session created but missing redirect URL");
      }
    } catch (error: any) {
      console.error('Payment session error:', error);
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
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Crown className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-green-800">🎉 Premium Plan Active!</h3>
                    <p className="text-green-600">
                      You are subscribed to {currentPlan === 'LIFETIME' ? 'Lifetime' : 'Monthly'} plan
                    </p>
                    <p className="text-sm text-green-500 mt-1">
                      {currentPlan === 'LIFETIME' ? 'Enjoy unlimited lifetime access!' : 'Your subscription is active and renewed monthly'}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  ✓ Active
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
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                    ✓ Purchased
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
