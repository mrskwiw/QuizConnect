import { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../lib/database';

export const useUser = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userService.getProfile(userId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
};