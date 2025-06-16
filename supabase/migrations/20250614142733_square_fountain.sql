/*
  # Add missing username column to users table

  1. Changes
    - Add username column to users table
    - Make username unique and not null
    - Update existing users with placeholder usernames
    - Add index for performance

  2. Security
    - Maintain existing RLS policies
    - Ensure username uniqueness
*/

-- Add username column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    -- Add username column (nullable first)
    ALTER TABLE users ADD COLUMN username text;
    
    -- Update existing users with placeholder usernames based on email
    UPDATE users 
    SET username = CONCAT('user_', SUBSTRING(id::text, 1, 8))
    WHERE username IS NULL;
    
    -- Make username not null and unique
    ALTER TABLE users ALTER COLUMN username SET NOT NULL;
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  END IF;
END $$;

-- Ensure email column exists and is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_email_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Update RLS policies to include username access
DROP POLICY IF EXISTS "Users can read all public profiles" ON users;
CREATE POLICY "Users can read all public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (NOT is_private OR auth.uid() = id);

-- Function to generate unique username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Extract username part from email and clean it
  base_username := LOWER(REGEXP_REPLACE(
    SPLIT_PART(email_input, '@', 1), 
    '[^a-z0-9_]', 
    '_', 
    'g'
  ));
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || '_user';
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(base_username) > 20 THEN
    base_username := SUBSTRING(base_username, 1, 20);
  END IF;
  
  final_username := base_username;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username) LOOP
    final_username := base_username || '_' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate username if not provided
  IF NEW.username IS NULL THEN
    generated_username := generate_username_from_email(NEW.email);
    NEW.username := generated_username;
  END IF;
  
  -- Set default subscription values
  IF NEW.subscription_tier IS NULL THEN
    NEW.subscription_tier := 'free';
  END IF;
  
  IF NEW.subscription_status IS NULL THEN
    NEW.subscription_status := 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();