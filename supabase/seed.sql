/*
  # Quiz Connect: Sample Data

  This file contains sample data to populate the database for development and testing.
  It should be run after the main schema has been created.
*/

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

-- Create sample quizzes using the demo user ID that matches AuthContext
INSERT INTO quizzes (id, author_id, title, description, category, difficulty, is_public, time_limit, pass_threshold, visibility, created_at) VALUES
-- Science Quizzes
('11111111-1111-1111-1111-111111111101', 'demo-user', 'Basic Physics Fundamentals', 'Test your understanding of fundamental physics concepts including motion, forces, and energy. Perfect for high school students and physics enthusiasts.', 'Science', 'Medium', true, 15, 70, 'public', now() - interval '2 weeks'),
('11111111-1111-1111-1111-111111111102', 'demo-user', 'Chemistry Elements Quiz', 'How well do you know the periodic table? Test your knowledge of chemical elements, their properties, and common compounds.', 'Science', 'Hard', true, 20, 75, 'public', now() - interval '1 week'),
('11111111-1111-1111-1111-111111111103', 'demo-user', 'Human Body Systems', 'Explore the amazing human body! This quiz covers major organ systems and their functions.', 'Science', 'Easy', true, 12, 65, 'public', now() - interval '3 days'),

-- History Quizzes
('11111111-1111-1111-1111-111111111104', 'demo-user', 'World War II Timeline', 'Test your knowledge of key events, battles, and figures from World War II. A comprehensive quiz for history students.', 'History', 'Hard', true, 25, 80, 'public', now() - interval '10 days'),
('11111111-1111-1111-1111-111111111105', 'demo-user', 'Ancient Civilizations', 'Journey through time and explore the great civilizations of antiquity including Egypt, Greece, Rome, and Mesopotamia.', 'History', 'Medium', true, 18, 70, 'public', now() - interval '5 days'),

-- General Knowledge
('11111111-1111-1111-1111-111111111106', 'demo-user', 'General Knowledge Challenge', 'A fun mix of questions covering science, history, geography, sports, and entertainment. Perfect for trivia night!', 'General Knowledge', 'Easy', true, null, 60, 'public', now() - interval '1 day'),
('11111111-1111-1111-1111-111111111107', 'demo-user', 'Movie Trivia Extravaganza', 'Lights, camera, action! Test your knowledge of classic and modern films, actors, and movie history.', 'Entertainment', 'Medium', true, 20, 70, 'public', now() - interval '6 days'),

-- Technology
('11111111-1111-1111-1111-111111111108', 'demo-user', 'JavaScript Fundamentals', 'Essential JavaScript concepts every developer should know. Covers variables, functions, objects, and more.', 'Technology', 'Medium', true, 30, 75, 'public', now() - interval '4 days'),
('11111111-1111-1111-1111-111111111109', 'demo-user', 'Web Development Basics', 'HTML, CSS, and JavaScript basics for aspiring web developers. Start your coding journey here!', 'Technology', 'Easy', true, 25, 65, 'public', now() - interval '8 days'),

-- Geography
('11111111-1111-1111-1111-111111111110', 'demo-user', 'World Capitals Challenge', 'How many world capitals can you identify? Test your geographical knowledge with this comprehensive quiz.', 'Geography', 'Medium', true, 15, 70, 'public', now() - interval '2 days'),
('11111111-1111-1111-1111-111111111111', 'demo-user', 'European Geography', 'Explore the diverse continent of Europe! Countries, capitals, rivers, mountains, and cultural landmarks.', 'Geography', 'Hard', true, 22, 75, 'public', now() - interval '7 days'),

-- Mathematics
('11111111-1111-1111-1111-111111111112', 'demo-user', 'Basic Algebra Quiz', 'Fundamental algebra concepts including equations, inequalities, and graphing. Great for middle and high school students.', 'Mathematics', 'Medium', true, 20, 70, 'public', now() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

-- Create quiz stats
INSERT INTO quiz_stats (quiz_id, times_played, average_score, likes, shares) VALUES
('11111111-1111-1111-1111-111111111101', 234, 78, 45, 12),
('11111111-1111-1111-1111-111111111102', 156, 65, 32, 8),
('11111111-1111-1111-1111-111111111103', 189, 82, 38, 15),
('11111111-1111-1111-1111-111111111104', 98, 71, 28, 6),
('11111111-1111-1111-1111-111111111105', 167, 74, 41, 11),
('11111111-1111-1111-1111-111111111106', 445, 85, 89, 23),
('11111111-1111-1111-1111-111111111107', 312, 79, 67, 18),
('11111111-1111-1111-1111-111111111108', 89, 68, 24, 5),
('11111111-1111-1111-1111-111111111109', 203, 81, 52, 14),
('11111111-1111-1111-1111-111111111110', 278, 76, 58, 16),
('11111111-1111-1111-1111-111111111111', 134, 69, 31, 7),
('11111111-1111-1111-1111-111111111112', 145, 73, 35, 9)
ON CONFLICT (quiz_id) DO NOTHING;

-- Create questions for Quiz 1: Basic Physics Fundamentals
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222101', '11111111-1111-1111-1111-111111111101', 'What is the SI unit of force?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222102', '11111111-1111-1111-1111-111111111101', 'According to Newton''s first law, an object at rest will remain at rest unless acted upon by an external force.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222103', '11111111-1111-1111-1111-111111111101', 'What is the formula for kinetic energy?', 'MultipleChoice', 2, now()),
('22222222-2222-2222-2222-222222222104', '11111111-1111-1111-1111-111111111101', 'The acceleration due to gravity on Earth is approximately 9.8 m/s².', 'TrueFalse', 3, now()),
('22222222-2222-2222-2222-222222222105', '11111111-1111-1111-1111-111111111101', 'Which of the following is NOT a form of energy?', 'MultipleChoice', 4, now())
ON CONFLICT (id) DO NOTHING;

-- Create options for Quiz 1 questions
INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333101', '22222222-2222-2222-2222-222222222101', 'Newton (N)', true, 0),
('33333333-3333-3333-3333-333333333102', '22222222-2222-2222-2222-222222222101', 'Joule (J)', false, 1),
('33333333-3333-3333-3333-333333333103', '22222222-2222-2222-2222-222222222101', 'Watt (W)', false, 2),
('33333333-3333-3333-3333-333333333104', '22222222-2222-2222-2222-222222222101', 'Pascal (Pa)', false, 3),
-- Q2 options (True/False)
('33333333-3333-3333-3333-333333333105', '22222222-2222-2222-2222-222222222102', 'True', true, 0),
('33333333-3333-3333-3333-333333333106', '22222222-2222-2222-2222-222222222102', 'False', false, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333107', '22222222-2222-2222-2222-222222222103', 'KE = mv²', false, 0),
('33333333-3333-3333-3333-333333333108', '22222222-2222-2222-2222-222222222103', 'KE = ½mv²', true, 1),
('33333333-3333-3333-3333-333333333109', '22222222-2222-2222-2222-222222222103', 'KE = mgh', false, 2),
('33333333-3333-3333-3333-333333333110', '22222222-2222-2222-2222-222222222103', 'KE = F × d', false, 3),
-- Q4 options (True/False)
('33333333-3333-3333-3333-333333333111', '22222222-2222-2222-2222-222222222104', 'True', true, 0),
('33333333-3333-3333-3333-333333333112', '22222222-2222-2222-2222-222222222104', 'False', false, 1),
-- Q5 options
('33333333-3333-3333-3333-333333333113', '22222222-2222-2222-2222-222222222105', 'Kinetic energy', false, 0),
('33333333-3333-3333-3333-333333333114', '22222222-2222-2222-2222-222222222105', 'Potential energy', false, 1),
('33333333-3333-3333-3333-333333333115', '22222222-2222-2222-2222-222222222105', 'Thermal energy', false, 2),
('33333333-3333-3333-3333-333333333116', '22222222-2222-2222-2222-222222222105', 'Magnetic energy', true, 3)
ON CONFLICT (id) DO NOTHING;