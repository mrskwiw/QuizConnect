import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { SubscriptionTier } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../lib/subscription';

interface PricingPlansProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
  showCurrentPlan?: boolean;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  currentTier,
  onSelectPlan,
  showCurrentPlan = true
}) => {
  const getIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
    }
  };

  const getGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-blue-500 to-purple-600';
      case 'premium':
        return 'from-purple-600 to-pink-600';
    }
  };

  const isCurrentPlan = (tier: SubscriptionTier) => tier === currentTier;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.popular ? 'border-2 border-blue-500 shadow-lg scale-105' : ''
          } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}
          
          {isCurrentPlan(plan.id) && showCurrentPlan && (
            <div className="absolute -top-3 right-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Current Plan
              </span>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradient(plan.id)} flex items-center justify-center text-white mx-auto mb-4`}>
              {getIcon(plan.id)}
            </div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-lg font-normal text-gray-500">
                /{plan.interval}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => onSelectPlan(plan.id)}
              disabled={isCurrentPlan(plan.id)}
            >
              {isCurrentPlan(plan.id) 
                ? 'Current Plan' 
                : plan.price === 0 
                  ? 'Get Started' 
                  : `Upgrade to ${plan.name}`
              }
            </Button>

            {plan.id !== 'free' && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Cancel anytime. No hidden fees.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};