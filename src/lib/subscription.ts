import { SubscriptionTier, SubscriptionLimits, SubscriptionPlan } from '../types';

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Create unlimited quizzes',
      'Basic question types (Multiple Choice, True/False)',
      'Share with friends only',
      'Basic quiz analytics',
      'Community participation',
      'Take unlimited quizzes'
    ],
    limits: {
      quizzesPerMonth: null,
      questionsPerQuiz: 20,
      canCreateCommunities: false,
      canShareWithNonSubscribers: false,
      hasGamification: false,
      hasBadges: false,
      hasAchievements: false,
      hasAnalytics: false,
      hasAdvancedQuestionTypes: false,
      hasTemplateAccess: false,
      hasCustomBranding: false,
      storageLimit: 100 // 100MB
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    interval: 'month',
    popular: true,
    features: [
      'Everything in Free',
      'Share with anyone (including non-subscribers)',
      'Full gamification system',
      'Points, badges & achievements',
      'Advanced question types',
      'Template library access',
      'Detailed analytics',
      'Priority support'
    ],
    limits: {
      quizzesPerMonth: null,
      questionsPerQuiz: 50,
      canCreateCommunities: false,
      canShareWithNonSubscribers: true,
      hasGamification: true,
      hasBadges: true,
      hasAchievements: true,
      hasAnalytics: true,
      hasAdvancedQuestionTypes: true,
      hasTemplateAccess: true,
      hasCustomBranding: false,
      storageLimit: 1000 // 1GB
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 15,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Create and manage communities',
      'Unlimited questions per quiz',
      'Custom branding',
      'Advanced analytics & reporting',
      'White-label options',
      'API access',
      'Dedicated support'
    ],
    limits: {
      quizzesPerMonth: null,
      questionsPerQuiz: null,
      canCreateCommunities: true,
      canShareWithNonSubscribers: true,
      hasGamification: true,
      hasBadges: true,
      hasAchievements: true,
      hasAnalytics: true,
      hasAdvancedQuestionTypes: true,
      hasTemplateAccess: true,
      hasCustomBranding: true,
      storageLimit: 10000 // 10GB
    }
  }
];

// Helper functions for subscription management
export const getSubscriptionLimits = (tier: SubscriptionTier): SubscriptionLimits => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
  return plan?.limits || SUBSCRIPTION_PLANS[0].limits;
};

export const canAccessFeature = (userTier: SubscriptionTier, feature: keyof SubscriptionLimits): boolean => {
  const limits = getSubscriptionLimits(userTier);
  return limits[feature] as boolean;
};

export const getQuestionLimit = (userTier: SubscriptionTier): number | null => {
  const limits = getSubscriptionLimits(userTier);
  return limits.questionsPerQuiz;
};

export const canCreateQuiz = (userTier: SubscriptionTier, questionCount: number): boolean => {
  const limit = getQuestionLimit(userTier);
  return limit === null || questionCount <= limit;
};

export const canShareWithNonSubscribers = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'canShareWithNonSubscribers');
};

export const canCreateCommunities = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'canCreateCommunities');
};

export const hasGamificationAccess = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'hasGamification');
};

export const hasBadgeAccess = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'hasBadges');
};

export const hasAchievementAccess = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'hasAchievements');
};

export const hasAdvancedQuestionTypes = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'hasAdvancedQuestionTypes');
};

export const hasTemplateAccess = (userTier: SubscriptionTier): boolean => {
  return canAccessFeature(userTier, 'hasTemplateAccess');
};

export const getUpgradeMessage = (feature: string, requiredTier: SubscriptionTier): string => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === requiredTier);
  const planName = plan?.name || 'Pro';
  
  return `${feature} is available with ${planName} subscription. Upgrade to unlock this feature!`;
};

// Feature restriction helpers
export const getRestrictedQuestionTypes = (userTier: SubscriptionTier): string[] => {
  if (hasAdvancedQuestionTypes(userTier)) {
    return [];
  }
  return ['Matching', 'FillInBlank', 'ShortAnswer', 'Essay'];
};

export const isQuestionTypeAllowed = (userTier: SubscriptionTier, questionType: string): boolean => {
  const restrictedTypes = getRestrictedQuestionTypes(userTier);
  return !restrictedTypes.includes(questionType);
};