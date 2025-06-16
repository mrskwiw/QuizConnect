import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, ArrowLeft } from 'lucide-react';
import { supabase, getAuthRedirectUrl } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl('reset-password'),
      });

      if (error) throw error;

      setIsSuccess(true);
      showToast('Password reset instructions have been sent to your email', 'success');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-center mb-6">Reset your password</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {isSuccess ? (
        <div className="text-center">
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
            <p className="font-medium mb-1">Check your email</p>
            <p className="text-sm">
              We've sent password reset instructions to {email}
            </p>
          </div>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 flex items-center justify-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Send reset instructions
          </Button>

          <div className="mt-4 flex items-center justify-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft size={16} className="mr-1" />
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;