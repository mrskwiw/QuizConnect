import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Star, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PricingPlans } from '../../components/subscription/PricingPlans';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { SubscriptionTier } from '../../types';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (!user) {
      showToast('Please sign in to upgrade your subscription', 'warning');
      navigate('/login');
      return;
    }

    if (tier === 'free') {
      showToast('You are already on the free plan', 'info');
      return;
    }

    // In a real implementation, this would integrate with Stripe
    showToast('Subscription upgrade coming soon! This is a demo.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={18} />}
            className="absolute left-0"
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock powerful features to create better quizzes and engage with the community. 
          Start free and upgrade anytime.
        </p>
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8">What's Included</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <Star className="h-6 w-6 text-gray-500 mb-2" />
                      <span className="font-semibold">Free</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <Zap className="h-6 w-6 text-blue-500 mb-2" />
                      <span className="font-semibold">Pro</span>
                      <span className="text-sm text-gray-500">$5/month</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <Crown className="h-6 w-6 text-purple-500 mb-2" />
                      <span className="font-semibold">Premium</span>
                      <span className="text-sm text-gray-500">$15/month</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Create unlimited quizzes', free: true, pro: true, premium: true },
                  { feature: 'Basic question types', free: true, pro: true, premium: true },
                  { feature: 'Share with friends', free: true, pro: true, premium: true },
                  { feature: 'Take unlimited quizzes', free: true, pro: true, premium: true },
                  { feature: 'Questions per quiz', free: '20', pro: '50', premium: 'Unlimited' },
                  { feature: 'Share with non-subscribers', free: false, pro: true, premium: true },
                  { feature: 'Points & gamification', free: false, pro: true, premium: true },
                  { feature: 'Badges & achievements', free: false, pro: true, premium: true },
                  { feature: 'Advanced question types', free: false, pro: true, premium: true },
                  { feature: 'Template library', free: false, pro: true, premium: true },
                  { feature: 'Detailed analytics', free: false, pro: true, premium: true },
                  { feature: 'Create communities', free: false, pro: false, premium: true },
                  { feature: 'Custom branding', free: false, pro: false, premium: true },
                  { feature: 'API access', free: false, pro: false, premium: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-300">✗</span>
                        )
                      ) : (
                        <span className="text-sm">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-300">✗</span>
                        )
                      ) : (
                        <span className="text-sm">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-300">✗</span>
                        )
                      ) : (
                        <span className="text-sm">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <PricingPlans
        currentTier={user?.subscription?.tier || 'free'}
        onSelectPlan={handleSelectPlan}
        showCurrentPlan={!!user}
      />

      {/* FAQ */}
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-gray-600 text-sm">
                Your data is always safe. Some features may become read-only until you upgrade again.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Our free plan is generous and permanent. You can also try Pro features with a 14-day trial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;