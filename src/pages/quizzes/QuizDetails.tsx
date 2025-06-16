import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ThumbsUp, Share2, Flag, Play, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useQuiz } from '../../hooks/useQuizzes';
import { useAuth } from '../../contexts/AuthContext';
import { socialService } from '../../lib/database';
import { useToast } from '../../contexts/ToastContext';

const QuizDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { quiz, isLoading, error } = useQuiz(id);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (quiz) {
      setLikesCount(quiz.stats.likes);
    }
  }, [quiz]);

  const handleLike = async () => {
    if (!user) {
      showToast('Please log in to like quizzes', 'warning');
      return;
    }

    try {
      if (isLiked) {
        await socialService.unlikeQuiz(quiz!.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        showToast('Quiz unliked', 'info');
      } else {
        await socialService.likeQuiz(quiz!.id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        showToast('Quiz liked!', 'success');
      }
    } catch (error) {
      showToast('Failed to update like status', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz?.title,
          text: quiz?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      showToast('Quiz URL copied to clipboard!', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <p className="text-gray-600 mb-8">The quiz you're looking for doesn't exist or has been removed.</p>
        <Link to="/browse">
          <Button variant="primary">Browse Other Quizzes</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === quiz.author.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">{quiz.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock size={16} className="mr-1" />
              {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
            </span>
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              {quiz.stats.timesPlayed} plays
            </span>
            <span className="flex items-center">
              <ThumbsUp size={16} className="mr-1" />
              {likesCount} likes
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {isOwner ? (
            <Button 
              variant="secondary" 
              icon={<Edit size={18} />}
              onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
            >
              Edit Quiz
            </Button>
          ) : (
            <Button 
              variant="primary" 
              icon={<Play size={18} />}
              onClick={() => navigate(`/take-quiz/${quiz.id}`)}
            >
              Start Quiz
            </Button>
          )}
          <Button 
            variant={isLiked ? "accent" : "secondary"} 
            icon={<ThumbsUp size={18} />}
            onClick={handleLike}
          >
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button 
            variant="secondary" 
            icon={<Share2 size={18} />}
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>About this Quiz</CardTitle>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
              {quiz.category}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Difficulty</p>
              <p className="text-gray-600">{quiz.difficulty}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Questions</p>
              <p className="text-gray-600">{quiz.questions.length}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Pass Threshold</p>
              <p className="text-gray-600">{quiz.passThreshold}%</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Average Score</p>
              <p className="text-gray-600">{quiz.stats.averageScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Created By</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {quiz.author.username[0].toUpperCase()}
              </div>
              <div>
                <Link 
                  to={`/profile/${quiz.author.username}`}
                  className="font-medium hover:text-blue-600"
                >
                  {quiz.author.username}
                </Link>
                <p className="text-sm text-gray-500">
                  Created {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!isOwner && user && (
              <Button variant="secondary">Follow</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quiz.questions.slice(0, 2).map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium mb-3">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:border-blue-300 cursor-pointer"
                    >
                      <input
                        type={question.type === 'MultipleChoice' ? 'checkbox' : 'radio'}
                        name={`preview-question-${index}`}
                        disabled
                        className="text-blue-600"
                      />
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {quiz.questions.length > 2 && (
              <p className="text-sm text-gray-500 text-center">
                And {quiz.questions.length - 2} more questions...
              </p>
            )}
            <p className="text-sm text-gray-500 text-center">
              Start the quiz to see all questions and submit answers
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" icon={<Flag size={18} />}>
          Report Quiz
        </Button>
        {!isOwner && (
          <Button 
            variant="primary" 
            size="lg"
            icon={<Play size={18} />}
            onClick={() => navigate(`/take-quiz/${quiz.id}`)}
          >
            Start Quiz
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizDetails;