import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Quiz, QuizResult } from '../../types';

interface QuizResultsProps {
  results: QuizResult;
  quiz: Quiz;
  onRetake: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ results, quiz, onRetake }) => {
  const navigate = useNavigate();
  const percentage = Math.round((results.score / results.maxScore) * 100);
  const passed = percentage >= quiz.passThreshold;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Quiz Complete'}
            </h1>
            <p className="text-gray-600">
              {passed ? 'You passed the quiz!' : 'Better luck next time!'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
              <p className="text-sm text-gray-600">Your Score</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">{results.score}</p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-600">{Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s</p>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="secondary" onClick={onRetake}>
              Retake Quiz
            </Button>
            <Button variant="primary" onClick={() => navigate('/browse')}>
              Browse More Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};