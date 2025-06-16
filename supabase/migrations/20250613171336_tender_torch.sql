/*
  # Quiz and Question Management

  1. New Tables
    - `quizzes` - Main quiz information
      - `id` (uuid, primary key)
      - `author_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text)
      - `is_public` (boolean, default true)
      - `time_limit` (integer, optional)
      - `pass_threshold` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_stats` - Quiz statistics
      - `quiz_id` (uuid, foreign key to quizzes)
      - `times_played` (integer, default 0)
      - `average_score` (integer, default 0)
      - `likes` (integer, default 0)
      - `shares` (integer, default 0)
      - `updated_at` (timestamp)
    
    - `questions` - Quiz questions
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key to quizzes)
      - `text` (text)
      - `type` (text)
      - `image_url` (text, optional)
      - `time_limit` (integer, optional)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `question_options` - Question answer options
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions)
      - `text` (text)
      - `is_correct` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for quiz creation, reading, and management
    - Public read access for public quizzes
    - Author-only access for private quizzes and editing
*/

-- Create quizzes table
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz stats table
CREATE TABLE IF NOT EXISTS quiz_stats (
  quiz_id uuid PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
  times_played integer DEFAULT 0 NOT NULL,
  average_score integer DEFAULT 0 NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  shares integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
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

-- Create question options table
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  is_correct boolean NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Quiz policies
CREATE POLICY "Anyone can read public quizzes"
  ON quizzes
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can read their own quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create quizzes"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Quiz stats policies
CREATE POLICY "Anyone can read quiz stats for public quizzes"
  ON quiz_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_stats.quiz_id 
      AND quizzes.is_public = true
    )
  );

CREATE POLICY "Users can read stats for their own quizzes"
  ON quiz_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_stats.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "System can update quiz stats"
  ON quiz_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Questions policies
CREATE POLICY "Anyone can read questions for public quizzes"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.is_public = true
    )
  );

CREATE POLICY "Users can read questions for their own quizzes"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage questions for their own quizzes"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.author_id = auth.uid()
    )
  );

-- Question options policies
CREATE POLICY "Anyone can read options for public quiz questions"
  ON question_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id 
      AND quizzes.is_public = true
    )
  );

CREATE POLICY "Users can read options for their own quiz questions"
  ON question_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id 
      AND quizzes.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage options for their own quiz questions"
  ON question_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id 
      AND quizzes.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id 
      AND quizzes.author_id = auth.uid()
    )
  );

-- Function to automatically create quiz stats
CREATE OR REPLACE FUNCTION handle_new_quiz()
RETURNS trigger AS $$
BEGIN
  INSERT INTO quiz_stats (quiz_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create quiz stats
CREATE TRIGGER on_quiz_created
  AFTER INSERT ON quizzes
  FOR EACH ROW EXECUTE FUNCTION handle_new_quiz();

-- Add updated_at triggers
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_stats_updated_at
  BEFORE UPDATE ON quiz_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON quizzes(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order_index ON question_options(question_id, order_index);