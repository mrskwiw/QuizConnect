import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const handlePromote = async () => {
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
      const { error: rpcError } = await supabase.rpc('promote_user_to_premium', {
        target_user_id: targetUserId,
      });

      if (rpcError) throw rpcError;

      showToast(`Successfully promoted user "${username}" to the premium tier.`, 'success');
      setUsername('');
    } catch (error) {
      let errorMessage = 'An error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error promoting user:', error);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.subscription.tier !== 'premium') {
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
        <h2 className="text-lg font-semibold mb-4">Promote User to Premium</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username to promote"
            className="input flex-grow"
          />
          <Button onClick={handlePromote} isLoading={isLoading}>
            Promote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;