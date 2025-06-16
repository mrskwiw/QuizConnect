/*
  # Subscription System Implementation

  1. New Tables
    - `subscription_plans` - Available subscription tiers and their features
    - `subscription_usage` - Track usage limits per user per period
    - `communities` - Premium feature for creating communities
    - `community_members` - Community membership tracking

  2. Schema Changes
    - Add subscription fields to `users` table
    - Add visibility and community fields to `quizzes` table

  3. Security
    - Enable RLS on all new tables
    - Add policies for subscription-based access control
    - Update quiz policies for visibility restrictions

  4. Functions
    - Subscription limit checking
    - Usage tracking
    - Community member count management
*/

-- Add subscription fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_tier text DEFAULT 'free';
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'active';
    ALTER TABLE users ADD COLUMN subscription_period_start timestamptz;
    ALTER TABLE users ADD COLUMN subscription_period_end timestamptz;
    ALTER TABLE users ADD COLUMN stripe_customer_id text;
    ALTER TABLE users ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;

-- Add visibility field to quizzes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN visibility text DEFAULT 'public';
    ALTER TABLE quizzes ADD COLUMN allowed_users jsonb DEFAULT '[]';
    ALTER TABLE quizzes ADD COLUMN community_id uuid;
  END IF;
END $$;

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL, -- in cents
  interval text NOT NULL, -- 'month' or 'year'
  features jsonb NOT NULL DEFAULT '[]',
  limits jsonb NOT NULL DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_type text NOT NULL, -- 'quizzes_created', 'questions_created', etc.
  usage_count integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, usage_type, period_start)
);

-- Create communities table for premium users
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  is_private boolean DEFAULT false,
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_count integer DEFAULT 0,
  quiz_count integer DEFAULT 0,
  avatar_url text,
  banner_url text,
  rules jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create community members table
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'member', 'moderator', 'admin', 'creator'
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can read active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for subscription_usage
CREATE POLICY "Users can read their own usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage"
  ON subscription_usage
  FOR ALL
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for communities
CREATE POLICY "Anyone can read public communities"
  ON communities
  FOR SELECT
  TO public
  USING (NOT is_private);

CREATE POLICY "Members can read private communities"
  ON communities
  FOR SELECT
  TO authenticated
  USING (
    is_private = false OR 
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = communities.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Premium users can create communities"
  ON communities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND subscription_tier IN ('premium')
    )
  );

CREATE POLICY "Community creators can update their communities"
  ON communities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Community creators can delete their communities"
  ON communities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- RLS Policies for community_members
CREATE POLICY "Anyone can read community memberships"
  ON community_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update quiz RLS policies for subscription-based access
DROP POLICY IF EXISTS "Anyone can read public quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can read their own quizzes" ON quizzes;

CREATE POLICY "Anyone can read truly public quizzes"
  ON quizzes
  FOR SELECT
  TO public
  USING (is_public = true AND visibility = 'public');

CREATE POLICY "Authenticated users can read subscriber quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (
    (is_public = true AND visibility = 'public') OR
    (is_public = true AND visibility = 'subscribers') OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = auth.uid() AND following_id = author_id
    )) OR
    (visibility = 'community' AND community_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = quizzes.community_id AND user_id = auth.uid()
    )) OR
    (auth.uid() = author_id)
  );

CREATE POLICY "Users can read their own quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price, interval, features, limits, is_popular) VALUES
('free', 'Free', 0, 'month', 
 '["Create unlimited quizzes", "Basic question types", "Share with friends", "Take unlimited quizzes"]',
 '{"quizzesPerMonth": null, "questionsPerQuiz": 20, "canCreateCommunities": false, "canShareWithNonSubscribers": false, "hasGamification": false, "hasBadges": false, "hasAchievements": false, "hasAnalytics": false, "hasAdvancedQuestionTypes": false, "hasTemplateAccess": false, "hasCustomBranding": false, "storageLimit": 100}',
 false),
('pro', 'Pro', 500, 'month',
 '["Everything in Free", "Share with anyone", "Full gamification", "Points & badges", "Advanced question types", "Template library", "Detailed analytics", "Priority support"]',
 '{"quizzesPerMonth": null, "questionsPerQuiz": 50, "canCreateCommunities": false, "canShareWithNonSubscribers": true, "hasGamification": true, "hasBadges": true, "hasAchievements": true, "hasAnalytics": true, "hasAdvancedQuestionTypes": true, "hasTemplateAccess": true, "hasCustomBranding": false, "storageLimit": 1000}',
 true),
('premium', 'Premium', 1500, 'month',
 '["Everything in Pro", "Create communities", "Unlimited questions", "Custom branding", "Advanced analytics", "White-label options", "API access", "Dedicated support"]',
 '{"quizzesPerMonth": null, "questionsPerQuiz": null, "canCreateCommunities": true, "canShareWithNonSubscribers": true, "hasGamification": true, "hasBadges": true, "hasAchievements": true, "hasAnalytics": true, "hasAdvancedQuestionTypes": true, "hasTemplateAccess": true, "hasCustomBranding": true, "storageLimit": 10000}',
 false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_quizzes_visibility ON quizzes(visibility);
CREATE INDEX IF NOT EXISTS idx_quizzes_community_id ON quizzes(community_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_type ON subscription_usage(user_id, usage_type);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  target_user_id uuid,
  limit_type text,
  limit_value integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
  current_usage integer;
  period_start timestamptz;
  period_end timestamptz;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = target_user_id;

  -- If no limit (null), return true
  IF limit_value IS NULL THEN
    RETURN true;
  END IF;

  -- Calculate current period
  period_start := date_trunc('month', now());
  period_end := period_start + interval '1 month';

  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM subscription_usage
  WHERE user_id = target_user_id 
    AND usage_type = limit_type
    AND period_start = period_start;

  -- Check if under limit
  RETURN current_usage < limit_value;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  target_user_id uuid,
  usage_type text,
  increment_by integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  period_start timestamptz;
  period_end timestamptz;
BEGIN
  -- Calculate current period
  period_start := date_trunc('month', now());
  period_end := period_start + interval '1 month';

  -- Insert or update usage
  INSERT INTO subscription_usage (user_id, usage_type, usage_count, period_start, period_end)
  VALUES (target_user_id, usage_type, increment_by, period_start, period_end)
  ON CONFLICT (user_id, usage_type, period_start)
  DO UPDATE SET 
    usage_count = subscription_usage.usage_count + increment_by,
    updated_at = now();
END;
$$;

-- Function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_community_member_count_trigger ON community_members;
CREATE TRIGGER update_community_member_count_trigger
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- Update existing users to have free subscription
UPDATE users SET subscription_tier = 'free' WHERE subscription_tier IS NULL;