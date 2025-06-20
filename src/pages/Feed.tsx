import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Quiz } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const Feed = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: followedUsers, error: followError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followError) {
        console.error('Error fetching followed users:', followError);
        setLoading(false);
        return;
      }

      const followedUserIds = followedUsers.map((f) => f.following_id);

      const { data: quizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('*, author:users(*)')
        .in('author_id', followedUserIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (quizError) {
        console.error('Error fetching feed:', quizError);
      } else {
        setFeed(quizzes as Quiz[]);
      }
      setLoading(false);
    };

    fetchFeed();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Activity Feed</h1>
      {feed.length === 0 ? (
        <p>Your feed is empty. Follow some users to see their latest quizzes!</p>
      ) : (
        <div className="space-y-4">
          {feed.map((quiz) => (
            <div key={quiz.id} className="p-4 bg-white rounded-lg shadow">
              <Link to={`/quiz/${quiz.id}`} className="text-xl font-bold">{quiz.title}</Link>
              <p className="text-gray-600">by <Link to={`/profile/${quiz.author.username}`} className="text-blue-500">{quiz.author.username}</Link></p>
              <p className="text-gray-800 mt-2">{quiz.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;