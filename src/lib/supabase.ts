import { createClient } from '@supabase/supabase-js';

// Use placeholder values for demo purposes when environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Get the current domain for redirect URLs
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    return url.origin;
  }
  return '';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    debug: import.meta.env.DEV
  }
});

// Helper function to get auth redirect URLs
export const getAuthRedirectUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};