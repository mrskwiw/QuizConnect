import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    // Get the code from the URL search params
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (!code) {
      navigate('/login');
      return;
    }

    // Verify the recovery code
    const verifyRecovery = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          showToast('Invalid or expired recovery link', 'error');
          navigate('/login');
        } else {
          // If successful, the session is now active, and the user can set a new password.
          // No explicit redirect here, as the user stays on this page to set the password.
          // The handleSubmit will then navigate to login.
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify recovery link';
        showToast(message, 'error');
        navigate('/login');
      }
    };

    verifyRecovery();
  }, [navigate, location.search, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Supabase password update error:', error);
        setError(error.message || 'Failed to reset password. Please try again.');
        showToast(error.message || 'Failed to reset password', 'error');
      } else {
        showToast('Password has been successfully reset', 'success');
        navigate('/login');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      console.error('Unexpected error during password reset:', err);
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-center mb-6">Set new password</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;