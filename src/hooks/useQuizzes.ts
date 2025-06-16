import { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { quizService } from '../lib/database';

interface UseQuizzesOptions {
  category?: string;
  difficulty?: string;
  search?: string;
  authorId?: string;
  limit?: number;
}

export const useQuizzes = (options: UseQuizzesOptions = {}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await quizService.getQuizzes(options);
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [options.category, options.difficulty, options.search, options.authorId, options.limit]);

  return { quizzes, isLoading, error, refetch: () => fetchQuizzes() };
};

export const useQuiz = (quizId: string | undefined) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setQuiz(null);
      setIsLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await quizService.getQuiz(quizId);
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  return { quiz, isLoading, error };
};