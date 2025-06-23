import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Plus, Save, Sparkles, Crown, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { QuestionEditor } from '../../components/quiz/QuestionEditor';
import { SubscriptionGate } from '../../components/subscription/SubscriptionGate';
import { QuizCategory, QuizDifficulty, QuestionType, QuizTemplate, QuizVisibility } from '../../types';
import { quizService } from '../../lib/database';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { 
  getQuestionLimit, 
  canCreateQuiz, 
  hasAdvancedQuestionTypes, 
  canShareWithNonSubscribers,
  getRestrictedQuestionTypes,
  getUpgradeMessage
} from '../../lib/subscription';

interface QuestionData {
  text: string;
  type: QuestionType;
  options: string[];
  correctOptions: number[];
  imageUrl?: string;
  timeLimit?: number;
  matchingPairs?: Array<{ id: string; left: string; right: string }>;
  fillInBlanks?: Array<{
    id: string;
    text: string;
    blanks: Array<{
      id: string;
      position: number;
      correctAnswer: string;
      acceptableAnswers: string[];
    }>;
  }>;
  correctAnswer?: string;
  acceptableAnswers?: string[];
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if we're using a template
  const template = location.state?.template as QuizTemplate | undefined;
  const fromTemplate = location.state?.fromTemplate || false;
  
  // Quiz metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuizCategory>('General Knowledge');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Medium');
  const [visibility, setVisibility] = useState<QuizVisibility>('public');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [passThreshold, setPassThreshold] = useState('70');
  
  // Questions
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const userTier = user?.subscription?.tier || 'free';
  const questionLimit = getQuestionLimit(userTier);
  const restrictedQuestionTypes = getRestrictedQuestionTypes(userTier);

  // Initialize with template data if available
  useEffect(() => {
    if (template && fromTemplate) {
      setTitle(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setDifficulty(template.difficulty);
      setTimeLimit(template.estimatedTime.toString());
      
      // Convert template questions to QuestionData format
      const templateQuestions: QuestionData[] = template.questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options || ['', '', '', ''],
        correctOptions: q.correctOptions || [],
        matchingPairs: q.matchingPairs?.map((pair, index) => ({
          id: (index + 1).toString(),
          left: pair.left,
          right: pair.right
        })),
        fillInBlanks: q.fillInBlanks?.map((blank, index) => ({
          id: (index + 1).toString(),
          text: blank.text,
          blanks: blank.blanks.map((b, bIndex) => ({
            id: (bIndex + 1).toString(),
            position: b.position,
            correctAnswer: b.correctAnswer,
            acceptableAnswers: b.acceptableAnswers
          }))
        })),
        correctAnswer: q.correctAnswer,
        acceptableAnswers: q.acceptableAnswers
      }));
      
      setQuestions(templateQuestions);
      showToast(`Template "${template.name}" loaded successfully!`, 'success');
    }
  }, [template, fromTemplate, showToast]);

  const handleAddQuestion = () => {
    if (questionLimit && questions.length >= questionLimit) {
      showToast(getUpgradeMessage('More questions per quiz', 'pro'), 'warning');
      return;
    }

    setQuestions([
      ...questions,
      {
        text: '',
        type: 'MultipleChoice',
        options: ['', '', '', ''],
        correctOptions: [],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionData, value: QuestionData[keyof QuestionData]) => {
    // Check if trying to use restricted question type
    if (field === 'type' && typeof value === 'string' && restrictedQuestionTypes.includes(value)) {
      showToast(getUpgradeMessage('Advanced question types', 'pro'), 'warning');
      return;
    }

    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Quiz title is required';
    if (!description.trim()) return 'Quiz description is required';
    if (questions.length === 0) return 'At least one question is required';
    
    // Check question limit
    if (!canCreateQuiz(userTier, questions.length)) {
      return `You can only create quizzes with up to ${questionLimit} questions on your current plan`;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text.trim()) return `Question ${i + 1} text is required`;
      
      // Check if using restricted question types
      if (restrictedQuestionTypes.includes(question.type)) {
        return `Question ${i + 1} uses an advanced question type that requires Pro subscription`;
      }
      
      switch (question.type) {
        case 'MultipleChoice':
        case 'TrueFalse':
          if (question.correctOptions.length === 0) {
            return `Question ${i + 1} must have at least one correct answer`;
          }
          for (let j = 0; j < question.options.length; j++) {
            if (!question.options[j].trim()) {
              return `Question ${i + 1}, option ${j + 1} cannot be empty`;
            }
          }
          break;
          
        case 'Matching':
          if (!question.matchingPairs || question.matchingPairs.length < 2) {
            return `Question ${i + 1} must have at least 2 matching pairs`;
          }
          for (let j = 0; j < question.matchingPairs.length; j++) {
            if (!question.matchingPairs[j].left.trim() || !question.matchingPairs[j].right.trim()) {
              return `Question ${i + 1}, matching pair ${j + 1} cannot be empty`;
            }
          }
          break;
          
        case 'FillInBlank':
          if (!question.fillInBlanks?.[0]?.text.trim()) {
            return `Question ${i + 1} fill-in-blank text is required`;
          }
          if (!question.fillInBlanks[0].text.includes('{{blank}}')) {
            return `Question ${i + 1} must contain at least one {{blank}} marker`;
          }
          for (const blank of question.fillInBlanks[0].blanks) {
            if (!blank.correctAnswer.trim()) {
              return `Question ${i + 1} must have correct answers for all blanks`;
            }
          }
          break;
          
        case 'ShortAnswer':
          if (!question.correctAnswer?.trim()) {
            return `Question ${i + 1} must have a correct answer`;
          }
          break;
          
        case 'Essay':
          // Essay questions don't need validation beyond text
          break;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Transform questions to match the expected format
      const transformedQuestions = questions.map((question, index) => {
        const baseQuestion = {
          id: `temp-${index}`,
          text: question.text,
          type: question.type,
          imageUrl: question.imageUrl,
          timeLimit: question.timeLimit,
          options: [],
          correctOptionIds: []
        };

        switch (question.type) {
          case 'MultipleChoice':
          case 'TrueFalse':
            baseQuestion.options = question.options.map((text, optIndex) => ({
              id: `temp-opt-${index}-${optIndex}`,
              text
            }));
            baseQuestion.correctOptionIds = question.correctOptions.map(
              optIndex => `temp-opt-${index}-${optIndex}`
            );
            break;
            
          case 'Matching':
            // For matching questions, we'll store pairs in a special format
            baseQuestion.options = question.matchingPairs?.flatMap(pair => [
              { id: `temp-left-${index}-${pair.id}`, text: pair.left },
              { id: `temp-right-${index}-${pair.id}`, text: pair.right }
            ]) || [];
            break;
            
          case 'FillInBlank':
            // Store the template and correct answers
            baseQuestion.options = question.fillInBlanks?.[0]?.blanks.map(blank => ({
              id: `temp-blank-${index}-${blank.id}`,
              text: blank.correctAnswer
            })) || [];
            break;
            
          case 'ShortAnswer':
            baseQuestion.options = [
              { id: `temp-answer-${index}`, text: question.correctAnswer || '' },
              ...(question.acceptableAnswers || []).map((answer, aIndex) => ({
                id: `temp-alt-${index}-${aIndex}`,
                text: answer
              }))
            ];
            break;
            
          case 'Essay':
            // Essay questions don't need options
            break;
        }

        return baseQuestion;
      });

      const quizData = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        isPublic: visibility === 'public',
        visibility,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        passThreshold: parseInt(passThreshold),
        questions: transformedQuestions
      };

      const quizId = await quizService.createQuiz(quizData);
      
      showToast('Quiz created successfully!', 'success');
      navigate(`/quiz/${quizId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      showToast('Failed to create quiz. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibilityOptions = () => {
    const options = [
      { value: 'public', label: 'Public - Anyone can find and take this quiz' },
      { value: 'friends', label: 'Friends Only - Only people you follow can take this quiz' }
    ];

    if (canShareWithNonSubscribers(userTier)) {
      options.push({
        value: 'subscribers',
        label: 'Subscribers Only - Only QuizConnect subscribers can take this quiz'
      });
    }

    return options;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="flex items-center">
            {fromTemplate && template && (
              <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            )}
            {fromTemplate ? `Create Quiz from Template` : 'Create a New Quiz'}
          </h1>
          {fromTemplate && template && (
            <p className="text-gray-600 mt-2">
              Using template: <span className="font-medium">{template.name}</span>
            </p>
          )}
          {questionLimit && (
            <p className="text-sm text-gray-500 mt-1">
              Question limit: {questions.length}/{questionLimit}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          {!fromTemplate && (
            <Button 
              variant="secondary"
              onClick={() => navigate('/templates')}
              icon={<Sparkles size={18} />}
            >
              Use Template
            </Button>
          )}
          {userTier === 'free' && (
            <Button 
              variant="accent"
              onClick={() => navigate('/pricing')}
              icon={<Crown size={18} />}
            >
              Upgrade
            </Button>
          )}
          <Button 
            type="submit" 
            form="quiz-form" 
            variant="primary"
            isLoading={isSubmitting}
            icon={<Save size={18} />}
          >
            Publish Quiz
          </Button>
        </div>
      </div>

      <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Enter a catchy title for your quiz"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Describe what your quiz is about"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuizCategory)}
                  className="input"
                  required
                >
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Language">Language</option>
                  <option value="Art">Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty *
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                  className="input"
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="input"
                  placeholder="Optional"
                  min="1"
                  max="180"
                />
              </div>

              <div>
                <label htmlFor="passThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Pass Threshold (%) *
                </label>
                <input
                  type="number"
                  id="passThreshold"
                  value={passThreshold}
                  onChange={(e) => setPassThreshold(e.target.value)}
                  className="input"
                  required
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Visibility *
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as QuizVisibility)}
                className="input"
                required
              >
                {getVisibilityOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {!canShareWithNonSubscribers(userTier) && (
                <p className="text-xs text-gray-500 mt-1">
                  <Lock size={12} className="inline mr-1" />
                  Upgrade to Pro to share with non-subscribers
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Questions</h2>
            <Button
              type="button"
              onClick={handleAddQuestion}
              variant="primary"
              icon={<Plus size={18} />}
              disabled={questionLimit ? questions.length >= questionLimit : false}
            >
              Add Question
            </Button>
          </div>

          {questionLimit && questions.length >= questionLimit && (
            <SubscriptionGate
              feature="More Questions"
              description={`You've reached the ${questionLimit} question limit for your current plan. Upgrade to add more questions to your quiz.`}
              requiredTier="pro"
              currentTier={userTier}
              onUpgrade={() => navigate('/pricing')}
            />
          )}

          {questions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {fromTemplate ? 'Template questions will appear here' : 'No questions added yet'}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Create engaging questions using multiple choice, true/false
                  {hasAdvancedQuestionTypes(userTier) && ', matching, fill-in-the-blank, short answer, and essay'} formats.
                </p>
                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  variant="primary"
                  icon={<Plus size={18} />}
                >
                  Add Your First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => (
              <QuestionEditor
                key={index}
                question={question}
                questionIndex={index}
                onUpdate={(field, value) => updateQuestion(index, field, value)}
                onRemove={() => handleRemoveQuestion(index)}
                userTier={userTier}
                restrictedTypes={restrictedQuestionTypes}
              />
            ))
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;