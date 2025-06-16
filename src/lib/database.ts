import { supabase } from './supabase';
import { Quiz, User, QuizResult, Comment, Notification, LeaderboardEntry, PointsHistory, Badge, UserBadge, Achievement, UserAchievement, QuizTemplate } from '../types';

// User operations
export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        stats:user_stats(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Get user ranks
    const [weeklyRank, lifetimeRank] = await Promise.all([
      this.getUserWeeklyRank(userId),
      this.getUserLifetimeRank(userId)
    ]);

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      createdAt: data.created_at,
      isPrivate: data.is_private,
      subscription: {
        tier: data.subscription_tier || 'free',
        status: data.subscription_status || 'active',
        currentPeriodStart: data.subscription_period_start,
        currentPeriodEnd: data.subscription_period_end,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id
      },
      stats: {
        quizzesCreated: data.stats?.quizzes_created || 0,
        quizzesTaken: data.stats?.quizzes_taken || 0,
        averageScore: data.stats?.average_score || 0,
        totalPoints: data.stats?.total_points || 0,
        lifetimePoints: data.stats?.lifetime_points || 0,
        weeklyPoints: data.stats?.weekly_points || 0,
        weeklyRank: weeklyRank || 0,
        lifetimeRank: lifetimeRank || 0,
        followers: data.stats?.followers || 0,
        following: data.stats?.following || 0
      }
    };
  },

  async getUserWeeklyRank(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_user_weekly_rank', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error fetching weekly rank:', error);
      return 0;
    }

    return data || 0;
  },

  async getUserLifetimeRank(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_user_lifetime_rank', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error fetching lifetime rank:', error);
      return 0;
    }

    return data || 0;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        avatar_url: updates.avatarUrl,
        bio: updates.bio,
        is_private: updates.isPrivate,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  },

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        stats:user_stats(*)
      `)
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_private', false)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return Promise.all(data.map(async (user) => {
      const [weeklyRank, lifetimeRank] = await Promise.all([
        this.getUserWeeklyRank(user.id),
        this.getUserLifetimeRank(user.id)
      ]);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        isPrivate: user.is_private,
        subscription: {
          tier: user.subscription_tier || 'free',
          status: user.subscription_status || 'active',
          currentPeriodStart: user.subscription_period_start,
          currentPeriodEnd: user.subscription_period_end,
          stripeCustomerId: user.stripe_customer_id,
          stripeSubscriptionId: user.stripe_subscription_id
        },
        stats: {
          quizzesCreated: user.stats?.quizzes_created || 0,
          quizzesTaken: user.stats?.quizzes_taken || 0,
          averageScore: user.stats?.average_score || 0,
          totalPoints: user.stats?.total_points || 0,
          lifetimePoints: user.stats?.lifetime_points || 0,
          weeklyPoints: user.stats?.weekly_points || 0,
          weeklyRank: weeklyRank || 0,
          lifetimeRank: lifetimeRank || 0,
          followers: user.stats?.followers || 0,
          following: user.stats?.following || 0
        }
      };
    }));
  },

  async awardPoints(userId: string, points: number, source: string = 'general'): Promise<void> {
    const { error } = await supabase.rpc('award_points', {
      target_user_id: userId,
      points_amount: points,
      point_source: source
    });

    if (error) {
      throw new Error(`Failed to award points: ${error.message}`);
    }

    // Check and award badges after points are awarded
    await badgeService.checkAndAwardBadges(userId);
  },

  async getPointsHistory(userId: string, limit: number = 50): Promise<PointsHistory[]> {
    const { data, error } = await supabase
      .from('user_point_history')
      .select('*')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching points history:', error);
      return [];
    }

    return data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      pointsAwarded: entry.points_awarded,
      source: entry.source,
      awardedAt: entry.awarded_at,
      weekStartDate: entry.week_start_date
    }));
  }
};

// Badge and Achievement operations
export const badgeService = {
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      badgeId: item.badge_id,
      earnedAt: item.earned_at,
      progress: item.progress || {},
      badge: {
        id: item.badge.id,
        name: item.badge.name,
        description: item.badge.description,
        icon: item.badge.icon,
        color: item.badge.color,
        rarity: item.badge.rarity,
        requirements: item.badge.requirements || {},
        isActive: item.badge.is_active,
        createdAt: item.badge.created_at
      }
    }));
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      achievementId: item.achievement_id,
      unlockedAt: item.unlocked_at,
      progress: item.progress || {},
      achievement: {
        id: item.achievement.id,
        name: item.achievement.name,
        description: item.achievement.description,
        icon: item.achievement.icon,
        category: item.achievement.category,
        pointsReward: item.achievement.points_reward,
        badgeReward: item.achievement.badge_reward,
        requirements: item.achievement.requirements || {},
        isActive: item.achievement.is_active,
        createdAt: item.achievement.created_at
      }
    }));
  },

  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      rarity: badge.rarity,
      requirements: badge.requirements || {},
      isActive: badge.is_active,
      createdAt: badge.created_at
    }));
  },

  async checkAndAwardBadges(userId: string): Promise<void> {
    const { error } = await supabase.rpc('check_and_award_badges', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error checking and awarding badges:', error);
    }
  },

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await supabase.rpc('award_badge', {
      target_user_id: userId,
      target_badge_id: badgeId
    });

    if (error) {
      throw new Error(`Failed to award badge: ${error.message}`);
    }
  }
};

// Template operations
export const templateService = {
  async getTemplates(): Promise<QuizTemplate[]> {
    // For now, return mock templates since we don't have a templates table
    // In a real implementation, this would fetch from a database
    return getMockTemplates();
  },

  async getTemplate(templateId: string): Promise<QuizTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === templateId) || null;
  },

  async incrementUsage(templateId: string): Promise<void> {
    // In a real implementation, this would update the usage count in the database
    console.log(`Incrementing usage for template: ${templateId}`);
  },

  async createQuizFromTemplate(template: QuizTemplate, customizations: any): Promise<string> {
    // Transform template to quiz format and create
    const quizData = {
      title: customizations.title || template.name,
      description: customizations.description || template.description,
      category: template.category,
      difficulty: template.difficulty,
      isPublic: customizations.isPublic ?? true,
      timeLimit: customizations.timeLimit || template.estimatedTime,
      passThreshold: customizations.passThreshold || 70,
      questions: template.questions.map((q, index) => ({
        id: `temp-${index}`,
        text: q.text,
        type: q.type,
        options: q.options?.map((opt, optIndex) => ({
          id: `temp-opt-${index}-${optIndex}`,
          text: opt
        })) || [],
        correctOptionIds: q.correctOptions?.map(optIndex => `temp-opt-${index}-${optIndex}`) || []
      }))
    };

    return await quizService.createQuiz(quizData);
  }
};

// Mock templates function
function getMockTemplates(): QuizTemplate[] {
  return [
    {
      id: 'template-1',
      name: 'General Knowledge Starter',
      description: 'A well-rounded quiz covering basic general knowledge topics perfect for beginners.',
      category: 'General Knowledge',
      difficulty: 'Easy',
      icon: 'Star',
      color: '#3B82F6',
      tags: ['beginner', 'general', 'mixed-topics'],
      estimatedTime: 10,
      questionCount: 10,
      isPopular: true,
      usageCount: 1250,
      requiredTier: 'free',
      questions: [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          type: 'MultipleChoice',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctOptions: [2],
          explanation: 'Paris has been the capital of France since 987 AD.'
        },
        {
          id: 'q2',
          text: 'The Earth is flat.',
          type: 'TrueFalse',
          correctOptions: [1],
          explanation: 'The Earth is an oblate spheroid, not flat.'
        }
      ],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'template-2',
      name: 'Science Fundamentals',
      description: 'Essential science questions covering biology, chemistry, and physics basics.',
      category: 'Science',
      difficulty: 'Medium',
      icon: 'Zap',
      color: '#10B981',
      tags: ['science', 'biology', 'chemistry', 'physics'],
      estimatedTime: 15,
      questionCount: 12,
      isPopular: true,
      usageCount: 890,
      requiredTier: 'pro',
      questions: [
        {
          id: 'q1',
          text: 'What is the chemical symbol for water?',
          type: 'ShortAnswer',
          correctAnswer: 'H2O',
          acceptableAnswers: ['h2o', 'H₂O'],
          explanation: 'Water consists of two hydrogen atoms and one oxygen atom.'
        }
      ],
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'template-3',
      name: 'History Timeline',
      description: 'Test knowledge of major historical events and their chronological order.',
      category: 'History',
      difficulty: 'Medium',
      icon: 'Clock',
      color: '#F59E0B',
      tags: ['history', 'timeline', 'events'],
      estimatedTime: 20,
      questionCount: 15,
      isPopular: false,
      usageCount: 456,
      requiredTier: 'pro',
      questions: [
        {
          id: 'q1',
          text: 'Match the historical event with its year:',
          type: 'Matching',
          matchingPairs: [
            { left: 'World War II ended', right: '1945' },
            { left: 'Moon landing', right: '1969' }
          ]
        }
      ],
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 'template-4',
      name: 'Geography Challenge',
      description: 'Explore world geography with questions about countries, capitals, and landmarks.',
      category: 'Geography',
      difficulty: 'Hard',
      icon: 'Users',
      color: '#8B5CF6',
      tags: ['geography', 'countries', 'capitals', 'landmarks'],
      estimatedTime: 25,
      questionCount: 20,
      isPopular: true,
      usageCount: 723,
      requiredTier: 'pro',
      questions: [
        {
          id: 'q1',
          text: 'The {{blank}} is the longest river in the world.',
          type: 'FillInBlank',
          fillInBlanks: [{
            text: 'The {{blank}} is the longest river in the world.',
            blanks: [{
              id: '1',
              position: 0,
              correctAnswer: 'Nile',
              acceptableAnswers: ['Nile River']
            }]
          }]
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-5',
      name: 'Movie Trivia Night',
      description: 'Perfect for entertainment events with questions about popular movies and actors.',
      category: 'Entertainment',
      difficulty: 'Easy',
      icon: 'Star',
      color: '#EF4444',
      tags: ['movies', 'entertainment', 'trivia', 'fun'],
      estimatedTime: 12,
      questionCount: 15,
      isPopular: true,
      usageCount: 1100,
      requiredTier: 'free',
      questions: [
        {
          id: 'q1',
          text: 'Who directed the movie "Jaws"?',
          type: 'MultipleChoice',
          options: ['George Lucas', 'Steven Spielberg', 'Martin Scorsese', 'Francis Ford Coppola'],
          correctOptions: [1]
        }
      ],
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: 'template-6',
      name: 'Math Basics Assessment',
      description: 'Fundamental mathematics questions for students and learners.',
      category: 'Mathematics',
      difficulty: 'Medium',
      icon: 'Zap',
      color: '#06B6D4',
      tags: ['math', 'assessment', 'education', 'basics'],
      estimatedTime: 18,
      questionCount: 12,
      isPopular: false,
      usageCount: 334,
      requiredTier: 'free',
      questions: [
        {
          id: 'q1',
          text: 'What is 15 × 8?',
          type: 'ShortAnswer',
          correctAnswer: '120',
          acceptableAnswers: ['120']
        }
      ],
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    }
  ];
}

// Leaderboard operations
export const leaderboardService = {
  async getWeeklyLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
      limit_count: limit
    });

    if (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return [];
    }

    return data.map((entry: any) => ({
      userId: entry.user_id,
      username: entry.username,
      avatarUrl: entry.avatar_url,
      points: entry.weekly_points,
      rank: entry.rank
    }));
  },

  async getLifetimeLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_lifetime_leaderboard', {
      limit_count: limit
    });

    if (error) {
      console.error('Error fetching lifetime leaderboard:', error);
      return [];
    }

    return data.map((entry: any) => ({
      userId: entry.user_id,
      username: entry.username,
      avatarUrl: entry.avatar_url,
      points: entry.lifetime_points,
      rank: entry.rank
    }));
  },

  async resetWeeklyPoints(): Promise<void> {
    const { error } = await supabase.rpc('reset_weekly_points');

    if (error) {
      throw new Error(`Failed to reset weekly points: ${error.message}`);
    }
  }
};

// Quiz operations
export const quizService = {
  async getQuizzes(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Quiz[]> {
    console.log('Fetching quizzes with filters:', filters);
    
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        author:users!quizzes_author_id_fkey(id, username, avatar_url, subscription_tier, subscription_status),
        stats:quiz_stats(*),
        questions(id, text, type, options:question_options(*))
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.authorId) {
      query = query.eq('author_id', filters.authorId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }

    console.log('Fetched quizzes:', data?.length || 0);

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      isPublic: quiz.is_public,
      timeLimit: quiz.time_limit,
      passThreshold: quiz.pass_threshold,
      visibility: quiz.visibility || 'public',
      allowedUsers: quiz.allowed_users || [],
      communityId: quiz.community_id,
      author: {
        id: quiz.author.id,
        username: quiz.author.username,
        avatarUrl: quiz.author.avatar_url,
        subscription: {
          tier: quiz.author.subscription_tier || 'free',
          status: quiz.author.subscription_status || 'active'
        }
      },
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text
        })),
        correctOptionIds: q.options
          .filter((opt: any) => opt.is_correct)
          .map((opt: any) => opt.id)
      })),
      stats: {
        timesPlayed: quiz.stats?.times_played || 0,
        averageScore: quiz.stats?.average_score || 0,
        likes: quiz.stats?.likes || 0,
        shares: quiz.stats?.shares || 0
      },
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at
    }));
  },

  async getQuiz(quizId: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        author:users!quizzes_author_id_fkey(id, username, avatar_url, subscription_tier, subscription_status),
        stats:quiz_stats(*),
        questions(
          *,
          options:question_options(*)
        )
      `)
      .eq('id', quizId)
      .single();

    if (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      isPublic: data.is_public,
      timeLimit: data.time_limit,
      passThreshold: data.pass_threshold,
      visibility: data.visibility || 'public',
      allowedUsers: data.allowed_users || [],
      communityId: data.community_id,
      author: {
        id: data.author.id,
        username: data.author.username,
        avatarUrl: data.author.avatar_url,
        subscription: {
          tier: data.author.subscription_tier || 'free',
          status: data.author.subscription_status || 'active'
        }
      },
      questions: data.questions
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          imageUrl: q.image_url,
          timeLimit: q.time_limit,
          options: q.options
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((opt: any) => ({
              id: opt.id,
              text: opt.text
            })),
          correctOptionIds: q.options
            .filter((opt: any) => opt.is_correct)
            .map((opt: any) => opt.id)
        })),
      stats: {
        timesPlayed: data.stats?.times_played || 0,
        averageScore: data.stats?.average_score || 0,
        likes: data.stats?.likes || 0,
        shares: data.stats?.shares || 0
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'author' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create the quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        is_public: quiz.isPublic,
        visibility: quiz.visibility || 'public',
        time_limit: quiz.timeLimit,
        pass_threshold: quiz.passThreshold,
        author_id: user.id,
        allowed_users: quiz.allowedUsers || [],
        community_id: quiz.communityId
      })
      .select()
      .single();

    if (quizError) {
      throw new Error(`Failed to create quiz: ${quizError.message}`);
    }

    // Create questions and options
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizData.id,
          text: question.text,
          type: question.type,
          image_url: question.imageUrl,
          time_limit: question.timeLimit,
          order_index: i
        })
        .select()
        .single();

      if (questionError) {
        throw new Error(`Failed to create question: ${questionError.message}`);
      }

      // Create options
      const optionsToInsert = question.options.map((option, optionIndex) => ({
        question_id: questionData.id,
        text: option.text,
        is_correct: question.correctOptionIds.includes(option.id),
        order_index: optionIndex
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw new Error(`Failed to create options: ${optionsError.message}`);
      }
    }

    // Award points for creating a quiz
    await userService.awardPoints(user.id, 25, 'quiz_creation');

    return quizData.id;
  },

  async submitQuizAttempt(quizId: string, answers: any[], timeTaken: number): Promise<QuizResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get quiz with questions and correct answers
    const quiz = await this.getQuiz(quizId);
    if (!quiz) throw new Error('Quiz not found');

    // Calculate score
    let score = 0;
    const maxScore = quiz.questions.length;
    const processedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const answer = answers[i];
      const isCorrect = this.checkAnswer(question, answer.selectedOptionIds);
      
      if (isCorrect) score++;
      
      processedAnswers.push({
        questionId: question.id,
        selectedOptionIds: answer.selectedOptionIds,
        isCorrect,
        timeTaken: answer.timeTaken
      });
    }

    // Calculate points earned based on performance
    const percentage = Math.round((score / maxScore) * 100);
    const pointsEarned = this.calculatePointsForScore(percentage);

    // Save attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score,
        max_score: maxScore,
        time_taken: timeTaken
      })
      .select()
      .single();

    if (attemptError) {
      throw new Error(`Failed to save attempt: ${attemptError.message}`);
    }

    // Save individual answers
    const answersToInsert = processedAnswers.map(answer => ({
      attempt_id: attemptData.id,
      question_id: answer.questionId,
      selected_options: answer.selectedOptionIds,
      is_correct: answer.isCorrect,
      time_taken: answer.timeTaken
    }));

    const { error: answersError } = await supabase
      .from('quiz_attempt_answers')
      .insert(answersToInsert);

    if (answersError) {
      throw new Error(`Failed to save answers: ${answersError.message}`);
    }

    return {
      id: attemptData.id,
      quizId,
      userId: user.id,
      score,
      maxScore,
      timeTaken,
      completedAt: attemptData.completed_at,
      answers: processedAnswers,
      pointsEarned
    };
  },

  calculatePointsForScore(percentage: number): number {
    if (percentage >= 90) return 50;
    if (percentage >= 80) return 40;
    if (percentage >= 70) return 30;
    if (percentage >= 60) return 20;
    return 10;
  },

  checkAnswer(question: any, selectedOptionIds: string[]): boolean {
    const correctIds = new Set(question.correctOptionIds);
    const selectedIds = new Set(selectedOptionIds);
    
    return correctIds.size === selectedIds.size && 
           [...correctIds].every(id => selectedIds.has(id));
  }
};

// Social operations
export const socialService = {
  async followUser(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) {
      throw new Error(`Failed to follow user: ${error.message}`);
    }

    // Award points for social interaction
    await userService.awardPoints(user.id, 5, 'social_interaction');
  },

  async unfollowUser(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) {
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }
  },

  async likeQuiz(quizId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('quiz_likes')
      .insert({
        user_id: user.id,
        quiz_id: quizId
      });

    if (error) {
      throw new Error(`Failed to like quiz: ${error.message}`);
    }

    // Award points for social interaction
    await userService.awardPoints(user.id, 2, 'social_interaction');
  },

  async unlikeQuiz(quizId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('quiz_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('quiz_id', quizId);

    if (error) {
      throw new Error(`Failed to unlike quiz: ${error.message}`);
    }
  },

  async addComment(quizId: string, text: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        text
      });

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    // Award points for social interaction
    await userService.awardPoints(user.id, 3, 'social_interaction');
  },

  async getComments(quizId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(username, avatar_url)
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data.map(comment => ({
      id: comment.id,
      text: comment.text,
      userId: comment.user_id,
      username: comment.user.username,
      avatarUrl: comment.user.avatar_url,
      createdAt: comment.created_at
    }));
  }
};