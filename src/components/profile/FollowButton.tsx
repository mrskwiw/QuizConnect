import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface FollowButtonProps {
  userId: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkFollowing = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking follow status:', error);
      } else {
        setIsFollowing(!!data);
      }
      setLoading(false);
    };

    checkFollowing();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) return;

    setLoading(true);
    if (isFollowing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      if (error) {
        console.error('Error unfollowing user:', error);
      } else {
        setIsFollowing(false);
      }
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: userId });
      if (error) {
        console.error('Error following user:', error);
      } else {
        setIsFollowing(true);
      }
    }
    setLoading(false);
  };

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button onClick={handleFollow} disabled={loading}>
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};