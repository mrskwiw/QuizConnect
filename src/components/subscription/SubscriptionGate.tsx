import React from 'react';
import { Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { SubscriptionTier } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../lib/subscription';

interface SubscriptionGateProps {
  feature: string;
  description: string;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
  children?: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  feature,
  description,
  requiredTier,
  currentTier,
  onUpgrade,
  children
}) => {
  const requiredPlan = SUBSCRIPTION_PLANS.find(p => p.id === requiredTier);
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentTier);

  if (!requiredPlan || !currentPlan) {
    return <>{children}</>;
  }

  // If user has required tier or higher, show content
  const tierOrder = { free: 0, pro: 1, premium: 2 };
  if (tierOrder[currentTier] >= tierOrder[requiredTier]) {
    return <>{children}</>;
  }

  const getIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return 'from-blue-500 to-purple-600';
      case 'premium':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="p-8 text-center">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getGradient(requiredTier)} flex items-center justify-center text-white mx-auto mb-4`}>
          {getIcon(requiredTier)}
        </div>
        
        <h3 className="text-xl font-bold mb-2">{feature}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Required:</strong> {requiredPlan.name} subscription
          </p>
          <p className="text-sm text-gray-500">
            <strong>Current:</strong> {currentPlan.name} plan
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={onUpgrade}
            icon={<ArrowRight size={18} />}
            fullWidth
          >
            Upgrade to {requiredPlan.name} - ${requiredPlan.price}/month
          </Button>
          
          <div className="text-xs text-gray-500">
            Unlock {feature.toLowerCase()} and many more features
          </div>
        </div>
      </CardContent>
    </Card>
  );
};