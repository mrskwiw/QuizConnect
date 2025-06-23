import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionTier } from '../types';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';
import { userService } from '../lib/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const userData = await userService.getProfile(authUser.id);
      setUser(userData);
    }
  };

  useEffect(() => {
    // Check if we have valid Supabase configuration
    const hasValidConfig = import.meta.env.VITE_SUPABASE_URL && 
                          import.meta.env.VITE_SUPABASE_ANON_KEY &&
                          !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (!hasValidConfig) {
      // For demo purposes, set a mock user with free subscription
      setUser({
        id: 'demo-user',
        username: 'demo_user',
        email: 'demo@example.com',
        avatarUrl: null,
        bio: 'Demo user for QuizConnect',
        createdAt: new Date().toISOString(),
        isPrivate: false,
        subscription: {
          tier: 'free',
          status: 'active'
        },
        stats: {
          quizzesCreated: 5,
          quizzesTaken: 23,
          averageScore: 78,
          totalPoints: 1250,
          lifetimePoints: 1250,
          weeklyPoints: 150,
          weeklyRank: 42,
          lifetimeRank: 156,
          followers: 12,
          following: 8
        }
      });
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        try {
          const userData = await userService.getProfile(session.user.id);
          setUser(userData);
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const hasValidConfig = import.meta.env.VITE_SUPABASE_URL && 
                          import.meta.env.VITE_SUPABASE_ANON_KEY &&
                          !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (!hasValidConfig) {
      showToast('Demo mode: Authentication not available', 'warning');
      throw new Error('Authentication not configured');
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Successfully logged in', 'success');
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage.includes('Invalid login credentials')) {
        showToast('Invalid email or password. Please try again.', 'error');
      } else if (errorMessage.includes('Email not confirmed')) {
        showToast('Please verify your email before logging in.', 'error');
      } else if (errorMessage.includes('network')) {
        showToast('A network error occurred. Please check your connection and try again.', 'error');
      } else {
        showToast('An unexpected error occurred. Please try again later.', 'error');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const hasValidConfig = import.meta.env.VITE_SUPABASE_URL && 
                          import.meta.env.VITE_SUPABASE_ANON_KEY &&
                          !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (!hasValidConfig) {
      showToast('Demo mode: Registration not available', 'warning');
      throw new Error('Authentication not configured');
    }

    try {
      setIsLoading(true);
      
      // First, sign up the user with Supabase Auth
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser?.id) throw new Error('No user ID returned from signup');

      showToast('Registration successful! Please check your email to verify your account.', 'success');
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Provide more specific error messages
      if (errorMessage.includes('User already registered')) {
        showToast('An account with this email already exists. Please try logging in.', 'error');
      } else if (errorMessage.includes('duplicate key value violates unique constraint "users_username_key"')) {
        showToast('This username is already taken. Please choose another.', 'error');
      } else if (errorMessage.includes('Password should be at least 6 characters')) {
        showToast('Password must be at least 6 characters long.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      showToast('You have been logged out', 'info');
    } catch (error) {
      showToast('Logout failed', 'error');
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user?.id) return;

    try {
      await userService.updateProfile(user.id, userData);
      await refreshUser();
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
      throw error;
    }
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    if (!user) return;

    try {
      // In a real implementation, this would handle Stripe subscription updates
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          tier,
          status: 'active' as const,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      setUser(updatedUser);
      showToast(`Subscription updated to ${tier}`, 'success');
    } catch (error) {
      showToast('Failed to update subscription', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        updateSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
