/*
  # Quiz Connect: Consolidated Database Schema

  This file contains the complete database schema for the Quiz Connect application.
  It is a consolidation of all incremental migrations into a single, authoritative source.

  ## Table of Contents
  1. Core Tables
     - users
     - user_stats
     - quizzes
     - quiz_stats
     - questions
     - question_options
  2. Quiz and User Interaction Tables
     - quiz_attempts
     - quiz_attempt_answers
     - comments
     - user_follows
     - quiz_likes
     - notifications
  3. Subscription and Community Tables
     - subscription_plans
     - subscription_usage
     - communities
     - community_members
  4. Functions and Triggers
     - handle_new_user
     - handle_quiz_attempt
     - handle_follow_change
     - handle_quiz_like_change
     - update_updated_at_column
     - and more...
  5. Row Level Security (RLS) Policies
  6. Indexes
*/

-- Section 1: Core Tables

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  is_private boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  subscription_period_start timestamptz,
  subscription_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quizzes_created integer DEFAULT 0 NOT NULL,
  quizzes_taken integer DEFAULT 0 NOT NULL,
  average_score integer DEFAULT 0 NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  followers integer DEFAULT 0 NOT NULL,
  following integer DEFAULT 0 NOT NULL,
  lifetime_points integer DEFAULT 0 NOT NULL,
  weekly_points integer DEFAULT 0 NOT NULL,
  week_start_date date DEFAULT CURRENT_DATE,
  last_points_reset timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  is_public boolean DEFAULT true,
  time_limit integer,
  pass_threshold integer NOT NULL DEFAULT 70,
  visibility text DEFAULT 'public',
  allowed_users jsonb DEFAULT '[]',
  community_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_stats (
  quiz_id uuid PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
  times_played integer DEFAULT 0 NOT NULL,
  average_score integer DEFAULT 0 NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  shares integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  type text NOT NULL,
  image_url text,
  time_limit integer,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  is_correct boolean NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Section 2: Quiz and User Interaction Tables

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  max_score integer NOT NULL,
  time_taken integer NOT NULL,
  completed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_options jsonb NOT NULL,
  is_correct boolean NOT NULL,
  time_taken integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_follows (
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS quiz_likes (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  related_quiz_id uuid REFERENCES quizzes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_point_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  points_awarded integer NOT NULL,
  source text NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  week_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
);

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Section 3: Subscription and Community Tables

CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL,
  interval text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  limits jsonb NOT NULL DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_type text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, usage_type, period_start)
);

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

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Section 4: Functions and Triggers

CREATE OR REPLACE FUNCTION generate_username_from_email(email_input text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(email_input, '@', 1), '[^a-z0-9_]', '_', 'g'));
  IF LENGTH(base_username) < 3 THEN base_username := base_username || '_user'; END IF;
  IF LENGTH(base_username) > 20 THEN base_username := SUBSTRING(base_username, 1, 20); END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username) LOOP
    final_username := base_username || '_' || counter;
    counter := counter + 1;
  END LOOP;
  RETURN final_username;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO users (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', generate_username_from_email(NEW.email)),
    NEW.email
  );
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_quiz()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO quiz_stats (quiz_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION award_points(target_user_id uuid, points_amount integer, point_source text DEFAULT 'general')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_week_start date;
  user_week_start date;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  SELECT week_start_date INTO user_week_start FROM user_stats WHERE user_id = target_user_id;
  IF user_week_start IS NULL OR user_week_start < current_week_start THEN
    UPDATE user_stats SET weekly_points = points_amount, week_start_date = current_week_start, last_points_reset = now() WHERE user_id = target_user_id;
  ELSE
    UPDATE user_stats SET weekly_points = weekly_points + points_amount WHERE user_id = target_user_id;
  END IF;
  UPDATE user_stats SET lifetime_points = lifetime_points + points_amount, total_points = total_points + points_amount, updated_at = now() WHERE user_id = target_user_id;
  INSERT INTO user_point_history (user_id, points_awarded, source, awarded_at) VALUES (target_user_id, points_amount, point_source, now());
END;
$$;

CREATE OR REPLACE FUNCTION handle_quiz_attempt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  points_earned integer;
  percentage_score integer;
BEGIN
  percentage_score := ROUND((NEW.score * 100.0) / NEW.max_score);
  points_earned := CASE
    WHEN percentage_score >= 90 THEN 50
    WHEN percentage_score >= 80 THEN 40
    WHEN percentage_score >= 70 THEN 30
    WHEN percentage_score >= 60 THEN 20
    ELSE 10
  END;
  PERFORM award_points(NEW.user_id, points_earned, 'quiz_completion');
  UPDATE user_stats SET quizzes_taken = quizzes_taken + 1, average_score = (SELECT ROUND(AVG(score * 100.0 / max_score)) FROM quiz_attempts WHERE user_id = NEW.user_id), updated_at = now() WHERE user_id = NEW.user_id;
  UPDATE quiz_stats SET times_played = times_played + 1, average_score = (SELECT ROUND(AVG(score * 100.0 / max_score)) FROM quiz_attempts WHERE quiz_id = NEW.quiz_id), updated_at = now() WHERE quiz_id = NEW.quiz_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_follow_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats SET followers = followers + 1, updated_at = now() WHERE user_id = NEW.following_id;
    UPDATE user_stats SET following = following + 1, updated_at = now() WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats SET followers = followers - 1, updated_at = now() WHERE user_id = OLD.following_id;
    UPDATE user_stats SET following = following - 1, updated_at = now() WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION handle_quiz_like_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quiz_stats SET likes = likes + 1, updated_at = now() WHERE quiz_id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quiz_stats SET likes = likes - 1, updated_at = now() WHERE quiz_id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION set_user_subscription_tier(target_user_id uuid, new_tier text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_subscription_tier text;
BEGIN
  -- Get the subscription tier of the user calling this function
  SELECT subscription_tier INTO caller_subscription_tier
  FROM public.users
  WHERE id = auth.uid();

  -- Only allow admin users to execute this
  IF caller_subscription_tier = 'admin' THEN
    UPDATE public.users
    SET 
      subscription_tier = new_tier,
      subscription_status = 'active'
    WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'You do not have permission to perform this action.';
  END IF;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_quiz_created ON quizzes;
CREATE TRIGGER on_quiz_created AFTER INSERT ON quizzes FOR EACH ROW EXECUTE FUNCTION handle_new_quiz();

DROP TRIGGER IF EXISTS on_quiz_attempt_created ON quiz_attempts;
CREATE TRIGGER on_quiz_attempt_created AFTER INSERT ON quiz_attempts FOR EACH ROW EXECUTE FUNCTION handle_quiz_attempt();

DROP TRIGGER IF EXISTS on_follow_created ON user_follows;
CREATE TRIGGER on_follow_created AFTER INSERT ON user_follows FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

DROP TRIGGER IF EXISTS on_follow_deleted ON user_follows;
CREATE TRIGGER on_follow_deleted AFTER DELETE ON user_follows FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

DROP TRIGGER IF EXISTS on_quiz_like_created ON quiz_likes;
CREATE TRIGGER on_quiz_like_created AFTER INSERT ON quiz_likes FOR EACH ROW EXECUTE FUNCTION handle_quiz_like_change();

DROP TRIGGER IF EXISTS on_quiz_like_deleted ON quiz_likes;
CREATE TRIGGER on_quiz_like_deleted AFTER DELETE ON quiz_likes FOR EACH ROW EXECUTE FUNCTION handle_quiz_like_change();

DROP TRIGGER IF EXISTS update_community_member_count_trigger ON community_members;
CREATE TRIGGER update_community_member_count_trigger AFTER INSERT OR DELETE ON community_members FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_stats_updated_at BEFORE UPDATE ON quiz_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Section 5: Row Level Security (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read all public profiles" ON users FOR SELECT TO authenticated USING (
  (NOT is_private OR auth.uid() = id) AND
  NOT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = auth.uid() AND blocked_id = id) OR (blocker_id = id AND blocked_id = auth.uid())
  )
);
CREATE POLICY "Users can read their own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all user stats" ON user_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read truly public quizzes" ON quizzes FOR SELECT TO public USING (is_public = true AND visibility = 'public');
CREATE POLICY "Authenticated users can read subscriber quizzes" ON quizzes FOR SELECT TO authenticated USING (
  (
    (is_public = true AND visibility = 'public') OR
    (is_public = true AND visibility = 'subscribers') OR
    (visibility = 'friends' AND EXISTS (SELECT 1 FROM user_follows WHERE follower_id = auth.uid() AND following_id = author_id)) OR
    (visibility = 'community' AND community_id IS NOT NULL AND EXISTS (SELECT 1 FROM community_members WHERE community_id = quizzes.community_id AND user_id = auth.uid())) OR
    (auth.uid() = author_id)
  ) AND NOT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = auth.uid() AND blocked_id = quizzes.author_id) OR (blocker_id = quizzes.author_id AND blocked_id = auth.uid())
  )
);
CREATE POLICY "Users can read their own quizzes" ON quizzes FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can create quizzes" ON quizzes FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own quizzes" ON quizzes FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own quizzes" ON quizzes FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can view comments on quizzes they can see" ON comments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = comments.quiz_id) AND
    NOT EXISTS (SELECT 1 FROM user_blocks WHERE (blocker_id = auth.uid() AND blocked_id = comments.user_id) OR (blocker_id = comments.user_id AND blocked_id = auth.uid()))
);
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can block other users" ON user_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock users they have blocked" ON user_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "Users can see their own blocks" ON user_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

-- Section 6: Indexes

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON quizzes(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_quizzes_visibility ON quizzes(visibility);
CREATE INDEX IF NOT EXISTS idx_quizzes_community_id ON quizzes(community_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order_index ON question_options(question_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question_id ON quiz_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_quiz_id ON comments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz_id ON quiz_likes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_weekly_points ON user_stats(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_lifetime_points ON user_stats(lifetime_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_week_start ON user_stats(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_point_history_user_id ON user_point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_point_history_week ON user_point_history(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_point_history_source ON user_point_history(source);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_type ON subscription_usage(user_id, usage_type);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);