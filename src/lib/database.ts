import { supabase } from './supabase';
import { Quiz, QuizAnswer, Comment } from '../types';

export const quizService = {
  async getQuizzes(options: { category?: string; difficulty?: string; search?: string; authorId?: string; limit?: number; }) {
    let query = supabase
      .from('quizzes')
      .select('*, author:users(*), stats:quiz_stats(*)');

    if (options.search) {
      query = query.ilike('title', `%${options.search}%`);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }
    if (options.authorId) {
      query = query.eq('author_id', options.authorId);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Quiz[];
  },

  async getQuiz(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, questions(*, options:question_options(*)), author:users(*), stats:quiz_stats(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Quiz;
  },

  async submitQuizAttempt(quizId: string, answers: Partial<QuizAnswer>[], totalTimeTaken: number) {
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      quiz_id: quizId,
      answers: answers,
      time_taken: totalTimeTaken,
    });
    if (error) throw error;
    return data;
  },
};

export const leaderboardService = {
  async getLeaderboard(timeframe: 'weekly' | 'lifetime', limit = 50) {
    const pointsColumn = timeframe === 'weekly' ? 'weekly_points' : 'lifetime_points';

    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .order(pointsColumn, { ascending: false })
      .limit(limit);

    if (statsError) throw statsError;

    const userIds = stats.map((s) => s.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .in('id', userIds);

    if (usersError) throw usersError;

    const usersById = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, { id: string; username: string; avatar_url: string | null; }>);

    return stats.map((stat) => ({
      ...stat,
      user: usersById[stat.user_id],
    }));
  },
};

export const socialService = {
  async likeQuiz(quizId: string) {
    const { data, error } = await supabase.from('quiz_likes').insert({ quiz_id: quizId });
    if (error) throw error;
    return data;
  },

  async unlikeQuiz(quizId: string) {
    const { data, error } = await supabase.from('quiz_likes').delete().match({ quiz_id: quizId });
    if (error) throw error;
    return data;
  },

  async getComments(quizId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:users(*)')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Comment[];
  },

  async addComment(quizId: string, text: string) {
    const { data, error } = await supabase.from('comments').insert({ quiz_id: quizId, text });
    if (error) throw error;
    return data;
  },
};