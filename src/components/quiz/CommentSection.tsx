import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { socialService } from '../../lib/database';
import { Comment } from '../../types';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  quizId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ quizId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await socialService.getComments(quizId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        showToast('Failed to load comments', 'error');
      }
      setLoading(false);
    };

    fetchComments();
  }, [quizId, showToast]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to comment', 'warning');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await socialService.addComment(quizId, newComment);
      setNewComment('');
      // Refetch comments to show the new one
      const data = await socialService.getComments(quizId);
      setComments(data);
      showToast('Comment added!', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
      {user && (
        <form onSubmit={handleSubmitComment} className="flex space-x-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input flex-grow"
            placeholder="Add a comment..."
            rows={2}
            disabled={submitting}
          />
          <Button type="submit" isLoading={submitting}>
            Post
          </Button>
        </form>
      )}
      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <img
                src={comment.user.avatarUrl || `https://api.dicebear.com/8.x/identicon/svg?seed=${comment.user.username}`}
                alt={comment.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <Link to={`/profile/${comment.user.username}`} className="font-bold">
                  {comment.user.username}
                </Link>
                <p className="text-gray-600">{comment.text}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};