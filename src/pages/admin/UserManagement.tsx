import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { SubscriptionTier } from '../../types';

const UserManagement = () => {
  const [username, setUsername] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleSetTier = async () => {
    if (!username) {
      showToast('Please enter a username.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // First, get the user ID from the username
      const { data: users, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username);

      if (findError) throw findError;
      if (!users || users.length === 0) {
        showToast(`User "${username}" not found.`, 'error');
        setIsLoading(false);
        return;
      }

      const targetUserId = users[0].id;

      // Call the secure database function
      const { error: rpcError } = await supabase.rpc('set_user_subscription_tier', {
        target_user_id: targetUserId,
        new_tier: tier,
      });

      if (rpcError) throw rpcError;

      showToast(`Successfully set user "${username}" to the ${tier} tier.`, 'success');
      setUsername('');
    } catch (error) {
      let errorMessage = 'An error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error setting user tier:', error);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.subscription.tier !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Set User Subscription Tier</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="input"
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as SubscriptionTier)}
            className="input"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleSetTier} isLoading={isLoading}>
            Set Tier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;