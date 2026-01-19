import { type Request, type Response } from 'express';

interface SubscriptionRequest {
  planId: string;
  email: string;
  organizationId?: string;
}

interface SubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  planId: string;
  status: 'active' | 'pending' | 'cancelled';
  message: string;
}

const PRICING_PLANS = [
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

export const billingController = {
  async getPlans(_req: Request, res: Response) {
    return res.json({
      success: true,
      plans: PRICING_PLANS,
    });
  },

  async subscribe(req: Request, res: Response) {
    try {
      const { planId, email, organizationId } = req.body as SubscriptionRequest;

      if (!planId || !email) {
        return res.status(400).json({
          error: true,
          message: 'Plan ID and email are required',
        });
      }

      const plan = PRICING_PLANS.find((p) => p.id === planId);
      if (!plan) {
        return res.status(400).json({
          error: true,
          message: 'Invalid plan ID',
        });
      }

      const mockSubscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response: SubscriptionResponse = {
        success: true,
        subscriptionId: mockSubscriptionId,
        planId,
        status: 'active',
        message: `Successfully subscribed to ${plan.name} plan. This is a demo - Stripe integration coming soon.`,
      };

      console.log('Subscription created (mock):', {
        subscriptionId: mockSubscriptionId,
        planId,
        email,
        organizationId,
        timestamp: new Date().toISOString(),
      });

      return res.json(response);
    } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to process subscription',
      });
    }
  },

  async cancelSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({
          error: true,
          message: 'Subscription ID is required',
        });
      }

      console.log('Subscription cancelled (mock):', {
        subscriptionId,
        timestamp: new Date().toISOString(),
      });

      return res.json({
        success: true,
        subscriptionId,
        status: 'cancelled',
        message: 'Subscription cancelled successfully. This is a demo.',
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to cancel subscription',
      });
    }
  },
};
