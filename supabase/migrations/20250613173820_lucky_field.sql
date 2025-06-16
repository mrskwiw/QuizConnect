/*
  # Add Lifetime and Weekly Points Tracking

  1. Schema Updates
    - Add `lifetime_points` and `weekly_points` to user_stats
    - Add `points_earned_this_week` tracking
    - Add `week_start_date` for weekly reset tracking
    - Add `last_points_reset` timestamp

  2. Functions
    - Function to reset weekly points
    - Function to award points with both lifetime and weekly tracking
    - Function to get weekly leaderboard

  3. Indexes
    - Add indexes for efficient leaderboard queries
*/

-- Add new columns to user_stats table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'lifetime_points'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN lifetime_points integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'weekly_points'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN weekly_points integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'week_start_date'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN week_start_date date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'last_points_reset'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN last_points_reset timestamptz DEFAULT now();
  END IF;
END $$;

-- Migrate existing total_points to lifetime_points
UPDATE user_stats 
SET lifetime_points = total_points 
WHERE lifetime_points = 0 AND total_points > 0;

-- Function to award points (both lifetime and weekly)
CREATE OR REPLACE FUNCTION award_points(
  target_user_id uuid,
  points_amount integer,
  point_source text DEFAULT 'general'
)
RETURNS void AS $$
DECLARE
  current_week_start date;
  user_week_start date;
BEGIN
  -- Calculate current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  -- Get user's current week start
  SELECT week_start_date INTO user_week_start
  FROM user_stats
  WHERE user_id = target_user_id;
  
  -- Reset weekly points if it's a new week
  IF user_week_start IS NULL OR user_week_start < current_week_start THEN
    UPDATE user_stats
    SET 
      weekly_points = points_amount,
      week_start_date = current_week_start,
      last_points_reset = now()
    WHERE user_id = target_user_id;
  ELSE
    -- Add to existing weekly points
    UPDATE user_stats
    SET weekly_points = weekly_points + points_amount
    WHERE user_id = target_user_id;
  END IF;
  
  -- Always add to lifetime points and total points
  UPDATE user_stats
  SET 
    lifetime_points = lifetime_points + points_amount,
    total_points = total_points + points_amount,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the points award (optional - for analytics)
  INSERT INTO user_point_history (user_id, points_awarded, source, awarded_at)
  VALUES (target_user_id, points_amount, point_source, now())
  ON CONFLICT DO NOTHING; -- In case the table doesn't exist yet
  
EXCEPTION
  WHEN others THEN
    -- If point history table doesn't exist, just continue
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset weekly points for all users (can be called by a cron job)
CREATE OR REPLACE FUNCTION reset_weekly_points()
RETURNS void AS $$
DECLARE
  current_week_start date;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  UPDATE user_stats
  SET 
    weekly_points = 0,
    week_start_date = current_week_start,
    last_points_reset = now(),
    updated_at = now()
  WHERE week_start_date < current_week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly leaderboard
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  weekly_points integer,
  rank bigint
) AS $$
BEGIN
  -- First ensure all users have current week data
  PERFORM reset_weekly_points();
  
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.avatar_url,
    us.weekly_points,
    ROW_NUMBER() OVER (ORDER BY us.weekly_points DESC, us.updated_at ASC) as rank
  FROM user_stats us
  JOIN users u ON u.id = us.user_id
  WHERE us.weekly_points > 0
  ORDER BY us.weekly_points DESC, us.updated_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get lifetime leaderboard
CREATE OR REPLACE FUNCTION get_lifetime_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  lifetime_points integer,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.avatar_url,
    us.lifetime_points,
    ROW_NUMBER() OVER (ORDER BY us.lifetime_points DESC, us.updated_at ASC) as rank
  FROM user_stats us
  JOIN users u ON u.id = us.user_id
  WHERE us.lifetime_points > 0
  ORDER BY us.lifetime_points DESC, us.updated_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the quiz attempt handler to use the new points system
CREATE OR REPLACE FUNCTION handle_quiz_attempt()
RETURNS trigger AS $$
DECLARE
  points_earned integer;
  percentage_score integer;
BEGIN
  -- Calculate percentage score
  percentage_score := ROUND((NEW.score * 100.0) / NEW.max_score);
  
  -- Calculate points based on performance
  points_earned := CASE
    WHEN percentage_score >= 90 THEN 50
    WHEN percentage_score >= 80 THEN 40
    WHEN percentage_score >= 70 THEN 30
    WHEN percentage_score >= 60 THEN 20
    ELSE 10
  END;
  
  -- Award points using the new system
  PERFORM award_points(NEW.user_id, points_earned, 'quiz_completion');
  
  -- Update user stats (keeping existing logic)
  UPDATE user_stats 
  SET 
    quizzes_taken = quizzes_taken + 1,
    average_score = (
      SELECT ROUND(AVG(score * 100.0 / max_score))
      FROM quiz_attempts 
      WHERE user_id = NEW.user_id
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Update quiz stats
  UPDATE quiz_stats 
  SET 
    times_played = times_played + 1,
    average_score = (
      SELECT ROUND(AVG(score * 100.0 / max_score))
      FROM quiz_attempts 
      WHERE quiz_id = NEW.quiz_id
    ),
    updated_at = now()
  WHERE quiz_id = NEW.quiz_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optional points history table for detailed tracking
CREATE TABLE IF NOT EXISTS user_point_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  points_awarded integer NOT NULL,
  source text NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  week_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
);

-- Enable RLS on points history
ALTER TABLE user_point_history ENABLE ROW LEVEL SECURITY;

-- Points history policies
CREATE POLICY "Users can read their own point history"
  ON user_point_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert point history"
  ON user_point_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_weekly_points ON user_stats(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_lifetime_points ON user_stats(lifetime_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_week_start ON user_stats(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_point_history_user_id ON user_point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_point_history_week ON user_point_history(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_point_history_source ON user_point_history(source);

-- Function to get user's weekly rank
CREATE OR REPLACE FUNCTION get_user_weekly_rank(target_user_id uuid)
RETURNS integer AS $$
DECLARE
  user_rank integer;
BEGIN
  -- Ensure weekly points are current
  PERFORM reset_weekly_points();
  
  SELECT rank INTO user_rank
  FROM (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY weekly_points DESC, updated_at ASC) as rank
    FROM user_stats
    WHERE weekly_points > 0
  ) ranked_users
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's lifetime rank
CREATE OR REPLACE FUNCTION get_user_lifetime_rank(target_user_id uuid)
RETURNS integer AS $$
DECLARE
  user_rank integer;
BEGIN
  SELECT rank INTO user_rank
  FROM (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY lifetime_points DESC, updated_at ASC) as rank
    FROM user_stats
    WHERE lifetime_points > 0
  ) ranked_users
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;