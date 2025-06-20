import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { QuestionRenderer } from '../../components/quiz/QuestionRenderer';
import { useQuiz } from '../../hooks/useQuizzes';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../lib/database';
import { useToast } from '../../contexts/ToastContext';
import { QuizAnswer, QuizResult } from '../../types';
import { QuizResults } from './QuizResults';

const TakeQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { quiz, isLoading, error } = useQuiz(id);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswer>[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!user) {
      showToast('Please log in to take quizzes', 'warning');
      navigate('/login');
      return;
    }

    if (quiz) {
      setQuizStartTime(Date.now());
      setAnswers(new Array(quiz.questions.length).fill({}));
      if (quiz.timeLimit) {
        setTimeLeft(quiz.timeLimit * 60);
      }
    }
  }, [quiz, user, navigate, showToast]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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
        <Button variant="primary" onClick={() => navigate('/browse')}>
          Browse Other Quizzes
        </Button>
      </div>
    );
  }

  if (showResults && results && quiz) {
    return <QuizResults results={results} quiz={quiz} onRetake={() => window.location.reload()} />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswer = (answer: Partial<QuizAnswer>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      questionId: currentQuestion.id,
      ...answer
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // Save timing for current question
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      timeTaken
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      handleSubmit(newAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async (finalAnswers?: Partial<QuizAnswer>[]) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const answersToSubmit = finalAnswers || answers;
      const totalTimeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
      
      // Transform answers to the expected format
      const transformedAnswers = answersToSubmit.map(answer => ({
        questionId: answer.questionId || '',
        selectedOptionIds: answer.selectedOptionIds || [],
        timeTaken: answer.timeTaken,
        matchingAnswers: answer.matchingAnswers,
        fillInAnswers: answer.fillInAnswers,
        textAnswer: answer.textAnswer
      }));
      
      const result = await quizService.submitQuizAttempt(
        quiz.id,
        transformedAnswers,
        totalTimeTaken
      );
      
      setResults(result);
      setShowResults(true);
      showToast('Quiz completed successfully!', 'success');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showToast('Failed to submit quiz. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    const currentAnswer = answers[currentQuestionIndex];
    if (!currentAnswer) return false;

    switch (currentQuestion.type) {
      case 'MultipleChoice':
      case 'TrueFalse':
        return currentAnswer.selectedOptionIds && currentAnswer.selectedOptionIds.length > 0;
      case 'Matching':
        return currentAnswer.matchingAnswers && 
               Object.keys(currentAnswer.matchingAnswers).length >= (currentQuestion.matchingPairs?.length || 0);
      case 'FillInBlank':
        return currentAnswer.fillInAnswers && 
               Object.keys(currentAnswer.fillInAnswers).length >= (currentQuestion.fillInBlanks?.[0]?.blanks.length || 0);
      case 'ShortAnswer':
      case 'Essay':
        return currentAnswer.textAnswer && currentAnswer.textAnswer.trim().length > 0;
      default:
        return false;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center space-x-2">
            <Clock size={20} className={timeLeft < 60 ? "text-red-500" : "text-gray-500"} />
            <span className={`text-lg font-medium ${timeLeft < 60 ? "text-red-500" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <QuestionRenderer
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            onAnswer={handleAnswer}
            timeLeft={timeLeft || undefined}
            userAnswer={answers[currentQuestionIndex]}
          />

          {!canProceed() && (
            <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded-lg mt-6">
              <AlertCircle size={20} className="mr-2" />
              <p className="text-sm">Please provide an answer to continue</p>
            </div>
          )}

          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => navigate(`/quiz/${id}`)}
              disabled={isSubmitting}
            >
              Exit Quiz
            </Button>
            <Button
              variant="primary"
              disabled={!canProceed() || isSubmitting}
              onClick={handleNext}
              isLoading={isSubmitting}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeQuiz;