import { relations } from 'drizzle-orm';
import { 
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  json,
  primaryKey
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User stats table
export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  quizzesCreated: integer('quizzes_created').default(0).notNull(),
  quizzesTaken: integer('quizzes_taken').default(0).notNull(),
  averageScore: integer('average_score').default(0).notNull(),
  totalPoints: integer('total_points').default(0).notNull(),
  followers: integer('followers').default(0).notNull(),
  following: integer('following').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  timeLimit: integer('time_limit'),
  passThreshold: integer('pass_threshold').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Quiz stats table
export const quizStats = pgTable('quiz_stats', {
  quizId: uuid('quiz_id').references(() => quizzes.id).primaryKey(),
  timesPlayed: integer('times_played').default(0).notNull(),
  averageScore: integer('average_score').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  text: text('text').notNull(),
  type: text('type').notNull(),
  imageUrl: text('image_url'),
  timeLimit: integer('time_limit'),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Question options table
export const questionOptions = pgTable('question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Quiz attempts table
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  timeTaken: integer('time_taken').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull()
});

// Quiz attempt answers table
export const quizAttemptAnswers = pgTable('quiz_attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id').references(() => quizAttempts.id).notNull(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  selectedOptions: json('selected_options').$type<string[]>().notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeTaken: integer('time_taken'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User follows table
export const userFollows = pgTable('user_follows', {
  followerId: uuid('follower_id').references(() => users.id).notNull(),
  followingId: uuid('following_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  PRIMARY_KEY: primaryKey({ columns: [followerId, followingId] })
});

// Quiz likes table
export const quizLikes = pgTable('quiz_likes', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  PRIMARY_KEY: primaryKey({ columns: [userId, quizId] })
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  relatedUserId: uuid('related_user_id').references(() => users.id),
  relatedQuizId: uuid('related_quiz_id').references(() => quizzes.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  quizzes: many(quizzes),
  comments: many(comments),
  notifications: many(notifications),
  following: many(userFollows, { relationName: 'following' }),
  followers: many(userFollows, { relationName: 'followers' }),
  quizLikes: many(quizLikes),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId]
  })
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id]
  })
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  author: one(users, {
    fields: [quizzes.authorId],
    references: [users.id]
  }),
  questions: many(questions),
  comments: many(comments),
  likes: many(quizLikes),
  attempts: many(quizAttempts)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id]
  }),
  options: many(questionOptions)
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id]
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id]
  }),
  answers: many(quizAttemptAnswers)
}));