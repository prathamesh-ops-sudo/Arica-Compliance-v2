import { useState } from "react";
import { Check, Zap, Building2, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

const fallbackPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 5 organizations',
      'Basic compliance scanning',
      'Email support',
      'Monthly reports',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 25 organizations',
      'Advanced AI analysis',
      'Priority support',
      'Weekly reports',
      'PDF export',
      'Custom questionnaires',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited organizations',
      'Full AI-powered analysis',
      '24/7 dedicated support',
      'Real-time monitoring',
      'API access',
      'Custom integrations',
      'Compliance dashboard',
      'Audit trail',
    ],
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: plansData } = useQuery<{ success: boolean; plans: PricingPlan[] }>({
    queryKey: ["/api/billing/plans"],
    initialData: { success: true, plans: fallbackPlans },
  });

  const plans = plansData?.plans || fallbackPlans;

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          email: 'demo@example.com',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Subscription failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Successful",
        description: data.message || "Welcome to Arica Toucan!",
      });
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return Zap;
      case 'professional':
        return Building2;
      case 'enterprise':
        return Shield;
      default:
        return Zap;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your organization's compliance needs. 
            All plans include our core ISO 27001/27002 compliance features.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            const isPopular = plan.id === 'professional';
            const isLoading = subscribeMutation.isPending && selectedPlan === plan.id;

            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isPopular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`h-6 w-6 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribeMutation.isPending}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Get Started with ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            All Plans Include
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {[
              'ISO 27001 Compliance Scanning',
              'ISO 27002 Control Assessment',
              'AI-Powered Gap Analysis',
              'Remediation Recommendations',
              'Compliance Score Tracking',
              'Organization Management',
              'Secure Cloud Infrastructure',
              'Regular Security Updates',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            For large enterprises with specific compliance requirements, 
            we offer tailored solutions with dedicated support and custom integrations.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This is a demo environment. Stripe integration coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
