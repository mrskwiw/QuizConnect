// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: UserStats;
  isPrivate: boolean;
  subscription: UserSubscription;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'admin';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: SubscriptionLimits;
  popular?: boolean;
}

export interface SubscriptionLimits {
  quizzesPerMonth: number | null; // null = unlimited
  questionsPerQuiz: number | null;
  canCreateCommunities: boolean;
  canShareWithNonSubscribers: boolean;
  hasGamification: boolean;
  hasBadges: boolean;
  hasAchievements: boolean;
  hasAnalytics: boolean;
  hasAdvancedQuestionTypes: boolean;
  hasTemplateAccess: boolean;
  hasCustomBranding: boolean;
  storageLimit: number; // in MB
}

export interface UserStats {
  quizzesCreated: number;
  quizzesTaken: number;
  averageScore: number;
  totalPoints: number;
  lifetimePoints: number;
  weeklyPoints: number;
  weeklyRank: number;
  lifetimeRank: number;
  followers: number;
  following: number;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  isPublic: boolean;
  timeLimit: number | null;
  passThreshold: number;
  questions: Question[];
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    subscription: UserSubscription;
  };
  stats: QuizStats;
  createdAt: string;
  updatedAt: string;
  visibility: QuizVisibility;
  allowedUsers?: string[]; // For friend-only quizzes
  communityId?: string; // For community-restricted quizzes
}

export type QuizVisibility = 'public' | 'friends' | 'community' | 'subscribers';

export interface QuizStats {
  timesPlayed: number;
  averageScore: number;
  likes: number;
  shares: number;
}

export type QuizCategory = 
  | 'General Knowledge'
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Entertainment'
  | 'Sports'
  | 'Technology'
  | 'Mathematics'
  | 'Language'
  | 'Art'
  | 'Other';

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

// Question types
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  imageUrl?: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  timeLimit?: number;
  // New fields for enhanced question types
  matchingPairs?: MatchingPair[];
  fillInBlanks?: FillInBlank[];
  correctAnswer?: string; // For short answer questions
  acceptableAnswers?: string[]; // Alternative correct answers
}

export type QuestionType = 
  | 'MultipleChoice' 
  | 'TrueFalse' 
  | 'Matching'
  | 'FillInBlank'
  | 'ShortAnswer'
  | 'Essay';

export interface QuestionOption {
  id: string;
  text: string;
}

// New types for enhanced question formats
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface FillInBlank {
  id: string;
  text: string; // Text with blanks marked as {{blank}}
  blanks: BlankAnswer[];
}

export interface BlankAnswer {
  id: string;
  position: number;
  correctAnswer: string;
  acceptableAnswers: string[];
}

// Quiz result types
export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  timeTaken: number;
  completedAt: string;
  answers: QuizAnswer[];
  pointsEarned: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  timeTaken?: number;
  // New fields for enhanced answer types
  matchingAnswers?: Record<string, string>; // For matching questions
  fillInAnswers?: Record<string, string>; // For fill-in-blank questions
  textAnswer?: string; // For short answer/essay questions
}

// Comment types
export interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUserId?: string;
  relatedUsername?: string;
  relatedQuizId?: string;
  relatedQuizTitle?: string;
}

export type NotificationType = 
  | 'follow'
  | 'quiz_like'
  | 'quiz_comment'
  | 'quiz_share'
  | 'achievement'
  | 'points_earned'
  | 'subscription_updated'
  | 'subscription_expired';

// Leaderboard types
export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  weekly_points: number;
  lifetime_points: number;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export interface WeeklyLeaderboard extends LeaderboardEntry {
  weeklyPoints: number;
}

export interface LifetimeLeaderboard extends LeaderboardEntry {
  lifetimePoints: number;
}

// Points tracking types
export interface PointsHistory {
  id: string;
  userId: string;
  pointsAwarded: number;
  source: string;
  awardedAt: string;
  weekStartDate: string;
}

export type PointSource = 
  | 'quiz_completion'
  | 'quiz_creation'
  | 'daily_streak'
  | 'social_interaction'
  | 'achievement'
  | 'bonus';

// Badge and Achievement types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: BadgeRarity;
  requirements: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  progress: Record<string, unknown>;
  badge: Badge;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  pointsReward: number;
  badgeReward?: string;
  requirements: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: Record<string, unknown>;
  achievement: Achievement;
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory = 
  | 'profile'
  | 'creation'
  | 'participation'
  | 'performance'
  | 'social'
  | 'points'
  | 'exploration'
  | 'streak';

// Quiz Template types
export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  icon: string;
  color: string;
  tags: string[];
  estimatedTime: number; // in minutes
  questionCount: number;
  isPopular: boolean;
  usageCount: number;
  questions: TemplateQuestion[];
  createdAt: string;
  updatedAt: string;
  requiredTier: SubscriptionTier; // New field for template access control
}

export interface TemplateQuestion {
  id: string;
  text: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
  correctOptions?: number[];
  matchingPairs?: Omit<MatchingPair, 'id'>[];
  fillInBlanks?: Omit<FillInBlank, 'id'>[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  hints?: string[];
  explanation?: string;
}

export type TemplateCategory = 
  | 'Education'
  | 'Business'
  | 'Entertainment'
  | 'Assessment'
  | 'Training'
  | 'Survey'
  | 'Icebreaker'
  | 'Custom';

// Community types
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  creatorId: string;
  memberCount: number;
  quizCount: number;
  avatarUrl?: string;
  bannerUrl?: string;
  rules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityRole;
  joinedAt: string;
}

export type CommunityRole = 'member' | 'moderator' | 'admin' | 'creator';