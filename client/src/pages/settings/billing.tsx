import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useCreatePaymentSessionMutation, useGetSubscriptionQuery } from "@/features/billing";
import { toast } from "sonner";

const Billing = () => {
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
      // Call payment success endpoint to activate subscription
      fetch(`${import.meta.env.VITE_API_URL || "https://ai-finance-saas-th6o.onrender.com/api"}/billing/payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            toast.success(data.message);
            refetch(); // Refresh subscription data
            // Redirect to home page after successful payment
            setTimeout(() => {
              window.location.href = '/overview';
            }, 2000);
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {isSubscribed && (
        <div className="mb-6">
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

      <div className="grid md:grid-cols-2 gap-6">
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
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
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

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          All plans include a 30-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
};

export default Billing;
