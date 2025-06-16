import { Quiz, QuizCategory, QuizDifficulty, User } from '../types';

// Mock quiz data for development purposes
export function getMockQuizzes(): Quiz[] {
  const categories: QuizCategory[] = [
    'General Knowledge',
    'Science',
    'History',
    'Geography',
    'Entertainment',
    'Sports',
  ];

  const difficulties: QuizDifficulty[] = ['Easy', 'Medium', 'Hard'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `quiz-${i + 1}`,
    title: [
      'Ultimate Science Quiz',
      'History Challenge',
      'Geography Explorer',
      'Movie Trivia',
      'Music Legends Quiz',
      'Sports Champions',
      'Coding Basics',
      'Literature Classics',
      'Animal Kingdom',
      'Famous Landmarks',
      'Space Exploration',
      'Food & Cuisine'
    ][i],
    description: 'Test your knowledge with this exciting quiz covering various topics and interesting facts.',
    category: categories[Math.floor(Math.random() * categories.length)],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    isPublic: true,
    timeLimit: Math.random() > 0.5 ? Math.floor(Math.random() * 600) + 300 : null,
    passThreshold: 70,
    questions: [],
    author: {
      id: `user-${Math.floor(Math.random() * 5) + 1}`,
      username: [
        'quizmaster',
        'knowitall',
        'brainiac',
        'quizwhiz',
        'triviaexpert'
      ][Math.floor(Math.random() * 5)],
      avatarUrl: null
    },
    stats: {
      timesPlayed: Math.floor(Math.random() * 1000),
      averageScore: Math.floor(Math.random() * 40) + 60,
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50)
    },
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

// Mock user data for development purposes
export function getMockUsers(): User[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `user-${i + 1}`,
    username: [
      'quizmaster',
      'knowitall',
      'brainiac',
      'quizwhiz',
      'triviaexpert'
    ][i],
    email: `user${i + 1}@example.com`,
    avatarUrl: null,
    bio: i === 0 ? 'Quiz enthusiast and lifelong learner. I create quizzes on science and history topics.' : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      quizzesCreated: Math.floor(Math.random() * 30),
      quizzesTaken: Math.floor(Math.random() * 100),
      averageScore: Math.floor(Math.random() * 30) + 70,
      totalPoints: Math.floor(Math.random() * 5000),
      followers: Math.floor(Math.random() * 100),
      following: Math.floor(Math.random() * 50)
    },
    isPrivate: false
  }));
}