import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { socialService } from '../../lib/database';
import { supabase } from '../../lib/supabase';

interface LikeButtonProps {
  quizId: string;
  initialLikesCount: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ quizId, initialLikesCount }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkLiked = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_likes')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
      } else {
        setIsLiked(!!data);
      }
      setLoading(false);
    };

    checkLiked();
  }, [user, quizId]);

  const handleLike = async () => {
    if (!user) {
      showToast('Please log in to like quizzes', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        await socialService.unlikeQuiz(quizId);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
        showToast('Quiz unliked', 'info');
      } else {
        await socialService.likeQuiz(quizId);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        showToast('Quiz liked!', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to update like status', 'error');
    }
    setLoading(false);
  };

  return (
    <Button
      variant={isLiked ? 'accent' : 'secondary'}
      icon=<ThumbsUp size={18} />
      onClick={handleLike}
      disabled={loading}
    >
      {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
    </Button>
  );
};