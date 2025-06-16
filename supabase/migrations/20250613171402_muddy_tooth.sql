/*
  # Quiz Attempts and Social Features

  1. New Tables
    - `quiz_attempts` - User quiz attempt records
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key to quizzes)
      - `user_id` (uuid, foreign key to users)
      - `score` (integer)
      - `max_score` (integer)
      - `time_taken` (integer, seconds)
      - `completed_at` (timestamp)
    
    - `quiz_attempt_answers` - Individual question answers
      - `id` (uuid, primary key)
      - `attempt_id` (uuid, foreign key to quiz_attempts)
      - `question_id` (uuid, foreign key to questions)
      - `selected_options` (jsonb, array of option IDs)
      - `is_correct` (boolean)
      - `time_taken` (integer, optional)
      - `created_at` (timestamp)
    
    - `comments` - Quiz comments
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key to quizzes)
      - `user_id` (uuid, foreign key to users)
      - `text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_follows` - User following relationships
      - `follower_id` (uuid, foreign key to users)
      - `following_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - Primary key: (follower_id, following_id)
    
    - `quiz_likes` - Quiz likes
      - `user_id` (uuid, foreign key to users)
      - `quiz_id` (uuid, foreign key to quizzes)
      - `created_at` (timestamp)
      - Primary key: (user_id, quiz_id)
    
    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text)
      - `message` (text)
      - `is_read` (boolean, default false)
      - `related_user_id` (uuid, optional)
      - `related_quiz_id` (uuid, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for user data access
    - Ensure users can only access their own attempts and notifications

  3. Functions
    - Update user stats when quiz attempts are created
    - Update quiz stats when attempts are created
    - Handle follow/unfollow operations
*/

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  max_score integer NOT NULL,
  time_taken integer NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- Create quiz attempt answers table
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_options jsonb NOT NULL,
  is_correct boolean NOT NULL,
  time_taken integer,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user follows table
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create quiz likes table
CREATE TABLE IF NOT EXISTS quiz_likes (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, quiz_id)
);

-- Create notifications table
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

-- Enable Row Level Security
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Quiz attempts policies
CREATE POLICY "Users can read their own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Quiz authors can read attempts on their quizzes"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_attempts.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quiz attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Quiz attempt answers policies
CREATE POLICY "Users can read their own attempt answers"
  ON quiz_attempt_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts 
      WHERE quiz_attempts.id = quiz_attempt_answers.attempt_id 
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attempt answers"
  ON quiz_attempt_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts 
      WHERE quiz_attempts.id = quiz_attempt_answers.attempt_id 
      AND quiz_attempts.user_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Anyone can read comments on public quizzes"
  ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = comments.quiz_id 
      AND quizzes.is_public = true
    )
  );

CREATE POLICY "Users can read comments on their own quizzes"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = comments.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Users can read all follow relationships"
  ON user_follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follow relationships"
  ON user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationships"
  ON user_follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Quiz likes policies
CREATE POLICY "Users can read all quiz likes"
  ON quiz_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create quiz likes"
  ON quiz_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz likes"
  ON quiz_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update user stats after quiz attempt
CREATE OR REPLACE FUNCTION handle_quiz_attempt()
RETURNS trigger AS $$
BEGIN
  -- Update user stats
  UPDATE user_stats 
  SET 
    quizzes_taken = quizzes_taken + 1,
    total_points = total_points + NEW.score,
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

-- Trigger for quiz attempt stats update
CREATE TRIGGER on_quiz_attempt_created
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION handle_quiz_attempt();

-- Function to handle follow/unfollow stats
CREATE OR REPLACE FUNCTION handle_follow_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower count
    UPDATE user_stats 
    SET followers = followers + 1, updated_at = now()
    WHERE user_id = NEW.following_id;
    
    -- Update following count
    UPDATE user_stats 
    SET following = following + 1, updated_at = now()
    WHERE user_id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update follower count
    UPDATE user_stats 
    SET followers = followers - 1, updated_at = now()
    WHERE user_id = OLD.following_id;
    
    -- Update following count
    UPDATE user_stats 
    SET following = following - 1, updated_at = now()
    WHERE user_id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for follow stats
CREATE TRIGGER on_follow_created
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

-- Function to handle quiz likes
CREATE OR REPLACE FUNCTION handle_quiz_like_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quiz_stats 
    SET likes = likes + 1, updated_at = now()
    WHERE quiz_id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quiz_stats 
    SET likes = likes - 1, updated_at = now()
    WHERE quiz_id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for quiz likes
CREATE TRIGGER on_quiz_like_created
  AFTER INSERT ON quiz_likes
  FOR EACH ROW EXECUTE FUNCTION handle_quiz_like_change();

CREATE TRIGGER on_quiz_like_deleted
  AFTER DELETE ON quiz_likes
  FOR EACH ROW EXECUTE FUNCTION handle_quiz_like_change();

-- Add updated_at trigger for comments
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
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