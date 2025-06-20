import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProfileHeader } from '../../components/profile/ProfileHeader';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*, stats:user_stats(*)')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUser(data as User);
      }
      setLoading(false);
    };

    fetchUser();
  }, [username]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ProfileHeader user={user} />
      {/* Add tabs for quizzes, followers, following, etc. here */}
    </div>
  );
};

export default UserProfile;