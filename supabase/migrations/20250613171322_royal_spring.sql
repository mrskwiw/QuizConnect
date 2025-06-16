/*
  # User Management and Authentication Setup

  1. New Tables
    - `users` - User profiles and metadata
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text, unique)
      - `avatar_url` (text, optional)
      - `bio` (text, optional)
      - `is_private` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_stats` - User statistics and metrics
      - `user_id` (uuid, foreign key to users)
      - `quizzes_created` (integer, default 0)
      - `quizzes_taken` (integer, default 0)
      - `average_score` (integer, default 0)
      - `total_points` (integer, default 0)
      - `followers` (integer, default 0)
      - `following` (integer, default 0)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Functions
    - Trigger to automatically create user profile on signup
    - Trigger to automatically create user stats on profile creation
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quizzes_created integer DEFAULT 0 NOT NULL,
  quizzes_taken integer DEFAULT 0 NOT NULL,
  average_score integer DEFAULT 0 NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  followers integer DEFAULT 0 NOT NULL,
  following integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read all public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (NOT is_private OR auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can read all user stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile and stats
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();