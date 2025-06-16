/*
  # Add Sample Quiz Data

  1. Sample Quizzes
    - Creates 12 diverse sample quizzes across different categories
    - Uses the existing demo user ID from AuthContext
    - Includes realistic quiz statistics and engagement metrics

  2. Questions and Options
    - Multiple choice and true/false questions
    - Proper question ordering and correct answer marking
    - Covers various difficulty levels and topics

  3. Quiz Statistics
    - Realistic play counts, scores, and engagement metrics
    - Helps demonstrate the platform's social features
*/

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

-- Create questions for Quiz 6: General Knowledge Challenge
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106', 'What is the capital of Australia?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111106', 'The Great Wall of China is visible from space with the naked eye.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111106', 'Which planet is known as the "Red Planet"?', 'MultipleChoice', 2, now()),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111106', 'How many continents are there?', 'MultipleChoice', 3, now()),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111106', 'The human brain uses approximately 20% of the body''s total energy.', 'TrueFalse', 4, now()),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 'Which element has the chemical symbol "Au"?', 'MultipleChoice', 5, now())
ON CONFLICT (id) DO NOTHING;

-- Create options for Quiz 6 questions
INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333201', '22222222-2222-2222-2222-222222222201', 'Sydney', false, 0),
('33333333-3333-3333-3333-333333333202', '22222222-2222-2222-2222-222222222201', 'Melbourne', false, 1),
('33333333-3333-3333-3333-333333333203', '22222222-2222-2222-2222-222222222201', 'Canberra', true, 2),
('33333333-3333-3333-3333-333333333204', '22222222-2222-2222-2222-222222222201', 'Perth', false, 3),
-- Q2 options (True/False)
('33333333-3333-3333-3333-333333333205', '22222222-2222-2222-2222-222222222202', 'True', false, 0),
('33333333-3333-3333-3333-333333333206', '22222222-2222-2222-2222-222222222202', 'False', true, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333207', '22222222-2222-2222-2222-222222222203', 'Venus', false, 0),
('33333333-3333-3333-3333-333333333208', '22222222-2222-2222-2222-222222222203', 'Mars', true, 1),
('33333333-3333-3333-3333-333333333209', '22222222-2222-2222-2222-222222222203', 'Jupiter', false, 2),
('33333333-3333-3333-3333-333333333210', '22222222-2222-2222-2222-222222222203', 'Saturn', false, 3),
-- Q4 options
('33333333-3333-3333-3333-333333333211', '22222222-2222-2222-2222-222222222204', '5', false, 0),
('33333333-3333-3333-3333-333333333212', '22222222-2222-2222-2222-222222222204', '6', false, 1),
('33333333-3333-3333-3333-333333333213', '22222222-2222-2222-2222-222222222204', '7', true, 2),
('33333333-3333-3333-3333-333333333214', '22222222-2222-2222-2222-222222222204', '8', false, 3),
-- Q5 options (True/False)
('33333333-3333-3333-3333-333333333215', '22222222-2222-2222-2222-222222222205', 'True', true, 0),
('33333333-3333-3333-3333-333333333216', '22222222-2222-2222-2222-222222222205', 'False', false, 1),
-- Q6 options
('33333333-3333-3333-3333-333333333217', '22222222-2222-2222-2222-222222222206', 'Silver', false, 0),
('33333333-3333-3333-3333-333333333218', '22222222-2222-2222-2222-222222222206', 'Gold', true, 1),
('33333333-3333-3333-3333-333333333219', '22222222-2222-2222-2222-222222222206', 'Aluminum', false, 2),
('33333333-3333-3333-3333-333333333220', '22222222-2222-2222-2222-222222222206', 'Copper', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Create questions for Quiz 7: Movie Trivia
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222301', '11111111-1111-1111-1111-111111111107', 'Who directed the movie "Jaws" (1975)?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222302', '11111111-1111-1111-1111-111111111107', 'The movie "Titanic" won 11 Academy Awards.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222303', '11111111-1111-1111-1111-111111111107', 'Which actor played the character of Jack Sparrow?', 'MultipleChoice', 2, now()),
('22222222-2222-2222-2222-222222222304', '11111111-1111-1111-1111-111111111107', 'In which year was the first "Star Wars" movie released?', 'MultipleChoice', 3, now()),
('22222222-2222-2222-2222-222222222305', '11111111-1111-1111-1111-111111111107', 'The movie "The Godfather" was based on a novel.', 'TrueFalse', 4, now())
ON CONFLICT (id) DO NOTHING;

-- Create options for Quiz 7 questions
INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222301', 'George Lucas', false, 0),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222301', 'Steven Spielberg', true, 1),
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222301', 'Martin Scorsese', false, 2),
('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222301', 'Francis Ford Coppola', false, 3),
-- Q2 options (True/False)
('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222302', 'True', true, 0),
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222302', 'False', false, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222303', 'Orlando Bloom', false, 0),
('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222303', 'Johnny Depp', true, 1),
('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222303', 'Brad Pitt', false, 2),
('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222303', 'Leonardo DiCaprio', false, 3),
-- Q4 options
('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222304', '1975', false, 0),
('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222304', '1977', true, 1),
('33333333-3333-3333-3333-333333333313', '22222222-2222-2222-2222-222222222304', '1979', false, 2),
('33333333-3333-3333-3333-333333333314', '22222222-2222-2222-2222-222222222304', '1980', false, 3),
-- Q5 options (True/False)
('33333333-3333-3333-3333-333333333315', '22222222-2222-2222-2222-222222222305', 'True', true, 0),
('33333333-3333-3333-3333-333333333316', '22222222-2222-2222-2222-222222222305', 'False', false, 1)
ON CONFLICT (id) DO NOTHING;

-- Add a few more questions for other quizzes to make them substantial
-- Quiz 2: Chemistry Elements
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222501', '11111111-1111-1111-1111-111111111102', 'What is the atomic number of Carbon?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222502', '11111111-1111-1111-1111-111111111102', 'Helium is a noble gas.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222503', '11111111-1111-1111-1111-111111111102', 'Which element has the symbol "Fe"?', 'MultipleChoice', 2, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333501', '22222222-2222-2222-2222-222222222501', '4', false, 0),
('33333333-3333-3333-3333-333333333502', '22222222-2222-2222-2222-222222222501', '6', true, 1),
('33333333-3333-3333-3333-333333333503', '22222222-2222-2222-2222-222222222501', '8', false, 2),
('33333333-3333-3333-3333-333333333504', '22222222-2222-2222-2222-222222222501', '12', false, 3),
-- Q2 options
('33333333-3333-3333-3333-333333333505', '22222222-2222-2222-2222-222222222502', 'True', true, 0),
('33333333-3333-3333-3333-333333333506', '22222222-2222-2222-2222-222222222502', 'False', false, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333507', '22222222-2222-2222-2222-222222222503', 'Iron', true, 0),
('33333333-3333-3333-3333-333333333508', '22222222-2222-2222-2222-222222222503', 'Fluorine', false, 1),
('33333333-3333-3333-3333-333333333509', '22222222-2222-2222-2222-222222222503', 'Francium', false, 2),
('33333333-3333-3333-3333-333333333510', '22222222-2222-2222-2222-222222222503', 'Fermium', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Quiz 10: World Capitals
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222401', '11111111-1111-1111-1111-111111111110', 'What is the capital of Japan?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222402', '11111111-1111-1111-1111-111111111110', 'The capital of Brazil is Rio de Janeiro.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222403', '11111111-1111-1111-1111-111111111110', 'Which city is the capital of Canada?', 'MultipleChoice', 2, now())
ON CONFLICT (id) DO NOTHING;

-- Create options for Quiz 10 questions
INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333401', '22222222-2222-2222-2222-222222222401', 'Osaka', false, 0),
('33333333-3333-3333-3333-333333333402', '22222222-2222-2222-2222-222222222401', 'Tokyo', true, 1),
('33333333-3333-3333-3333-333333333403', '22222222-2222-2222-2222-222222222401', 'Kyoto', false, 2),
('33333333-3333-3333-3333-333333333404', '22222222-2222-2222-2222-222222222401', 'Hiroshima', false, 3),
-- Q2 options (True/False)
('33333333-3333-3333-3333-333333333405', '22222222-2222-2222-2222-222222222402', 'True', false, 0),
('33333333-3333-3333-3333-333333333406', '22222222-2222-2222-2222-222222222402', 'False', true, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333407', '22222222-2222-2222-2222-222222222403', 'Toronto', false, 0),
('33333333-3333-3333-3333-333333333408', '22222222-2222-2222-2222-222222222403', 'Vancouver', false, 1),
('33333333-3333-3333-3333-333333333409', '22222222-2222-2222-2222-222222222403', 'Ottawa', true, 2),
('33333333-3333-3333-3333-333333333410', '22222222-2222-2222-2222-222222222403', 'Montreal', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Quiz 3: Human Body Systems
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222701', '11111111-1111-1111-1111-111111111103', 'Which organ is responsible for pumping blood throughout the body?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222702', '11111111-1111-1111-1111-111111111103', 'The human body has 206 bones.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222703', '11111111-1111-1111-1111-111111111103', 'Which system is responsible for breathing?', 'MultipleChoice', 2, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333701', '22222222-2222-2222-2222-222222222701', 'Liver', false, 0),
('33333333-3333-3333-3333-333333333702', '22222222-2222-2222-2222-222222222701', 'Heart', true, 1),
('33333333-3333-3333-3333-333333333703', '22222222-2222-2222-2222-222222222701', 'Lungs', false, 2),
('33333333-3333-3333-3333-333333333704', '22222222-2222-2222-2222-222222222701', 'Kidneys', false, 3),
-- Q2 options
('33333333-3333-3333-3333-333333333705', '22222222-2222-2222-2222-222222222702', 'True', true, 0),
('33333333-3333-3333-3333-333333333706', '22222222-2222-2222-2222-222222222702', 'False', false, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333707', '22222222-2222-2222-2222-222222222703', 'Circulatory system', false, 0),
('33333333-3333-3333-3333-333333333708', '22222222-2222-2222-2222-222222222703', 'Respiratory system', true, 1),
('33333333-3333-3333-3333-333333333709', '22222222-2222-2222-2222-222222222703', 'Digestive system', false, 2),
('33333333-3333-3333-3333-333333333710', '22222222-2222-2222-2222-222222222703', 'Nervous system', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Quiz 8: JavaScript Fundamentals
INSERT INTO questions (id, quiz_id, text, type, order_index, created_at) VALUES
('22222222-2222-2222-2222-222222222601', '11111111-1111-1111-1111-111111111108', 'Which of the following is used to declare a variable in JavaScript?', 'MultipleChoice', 0, now()),
('22222222-2222-2222-2222-222222222602', '11111111-1111-1111-1111-111111111108', 'JavaScript is a case-sensitive language.', 'TrueFalse', 1, now()),
('22222222-2222-2222-2222-222222222603', '11111111-1111-1111-1111-111111111108', 'What does "DOM" stand for?', 'MultipleChoice', 2, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, text, is_correct, order_index) VALUES
-- Q1 options
('33333333-3333-3333-3333-333333333601', '22222222-2222-2222-2222-222222222601', 'var', true, 0),
('33333333-3333-3333-3333-333333333602', '22222222-2222-2222-2222-222222222601', 'variable', false, 1),
('33333333-3333-3333-3333-333333333603', '22222222-2222-2222-2222-222222222601', 'v', false, 2),
('33333333-3333-3333-3333-333333333604', '22222222-2222-2222-2222-222222222601', 'declare', false, 3),
-- Q2 options
('33333333-3333-3333-3333-333333333605', '22222222-2222-2222-2222-222222222602', 'True', true, 0),
('33333333-3333-3333-3333-333333333606', '22222222-2222-2222-2222-222222222602', 'False', false, 1),
-- Q3 options
('33333333-3333-3333-3333-333333333607', '22222222-2222-2222-2222-222222222603', 'Document Object Model', true, 0),
('33333333-3333-3333-3333-333333333608', '22222222-2222-2222-2222-222222222603', 'Data Object Management', false, 1),
('33333333-3333-3333-3333-333333333609', '22222222-2222-2222-2222-222222222603', 'Dynamic Object Mapping', false, 2),
('33333333-3333-3333-3333-333333333610', '22222222-2222-2222-2222-222222222603', 'Document Oriented Model', false, 3)
ON CONFLICT (id) DO NOTHING;