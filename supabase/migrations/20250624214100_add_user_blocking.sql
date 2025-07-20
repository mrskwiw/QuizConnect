-- Migration to add user blocking functionality.

-- 1. Create the user_blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- 2. Enable RLS for the new table
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- 3. Update RLS policies to respect blocks
DROP POLICY IF EXISTS "Users can read all public profiles" ON users;
CREATE POLICY "Users can read all public profiles" ON users FOR SELECT TO authenticated USING (
  (NOT is_private OR auth.uid() = id) AND
  NOT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = auth.uid() AND blocked_id = id) OR (blocker_id = id AND blocked_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Authenticated users can read subscriber quizzes" ON quizzes;
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

DROP POLICY IF EXISTS "Users can view comments on quizzes they can see" ON comments;
CREATE POLICY "Users can view comments on quizzes they can see" ON comments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = comments.quiz_id) AND
    NOT EXISTS (SELECT 1 FROM user_blocks WHERE (blocker_id = auth.uid() AND blocked_id = comments.user_id) OR (blocker_id = comments.user_id AND blocked_id = auth.uid()))
);

-- 4. Add RLS policies for the user_blocks table
CREATE POLICY "Users can block other users" ON user_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock users they have blocked" ON user_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "Users can see their own blocks" ON user_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

-- 5. Add indexes for the new table
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);