import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Question, QuizAnswer } from '../../types';

interface QuestionRendererProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: Partial<QuizAnswer>) => void;
  timeLeft?: number;
  showResults?: boolean;
  userAnswer?: Partial<QuizAnswer>;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  timeLeft,
  showResults = false,
  userAnswer
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [fillInAnswers, setFillInAnswers] = useState<Record<string, string>>({});
  const [textAnswer, setTextAnswer] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with existing answers if available
    if (userAnswer) {
      setSelectedOptions(userAnswer.selectedOptionIds || []);
      setMatchingAnswers(userAnswer.matchingAnswers || {});
      setFillInAnswers(userAnswer.fillInAnswers || {});
      setTextAnswer(userAnswer.textAnswer || '');
    }
  }, [userAnswer]);

  const handleOptionSelect = (optionId: string) => {
    let newSelected: string[];
    
    if (question.type === 'MultipleChoice') {
      newSelected = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      newSelected = [optionId];
    }
    
    setSelectedOptions(newSelected);
    onAnswer({ selectedOptionIds: newSelected });
  };

  const handleMatchingDrop = (leftId: string, rightValue: string) => {
    const newMatching = { ...matchingAnswers, [leftId]: rightValue };
    setMatchingAnswers(newMatching);
    onAnswer({ matchingAnswers: newMatching });
  };

  const handleFillInChange = (blankId: string, value: string) => {
    const newFillIn = { ...fillInAnswers, [blankId]: value };
    setFillInAnswers(newFillIn);
    onAnswer({ fillInAnswers: newFillIn });
  };

  const handleTextChange = (value: string) => {
    setTextAnswer(value);
    onAnswer({ textAnswer: value });
  };

  const renderFillInBlankText = (text: string, blanks: any[]) => {
    const parts = text.split(/\{\{blank\}\}/);
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      
      if (i < blanks.length) {
        const blank = blanks[i];
        result.push(
          <input
            key={`blank-${blank.id}`}
            type="text"
            value={fillInAnswers[blank.id] || ''}
            onChange={(e) => handleFillInChange(blank.id, e.target.value)}
            className="inline-block mx-1 px-2 py-1 border border-gray-300 rounded min-w-[100px] text-center"
            placeholder="___"
            disabled={showResults}
          />
        );
      }
    }
    
    return <div className="text-lg leading-relaxed">{result}</div>;
  };

  const isCorrectAnswer = (optionId: string): boolean => {
    return question.correctOptionIds.includes(optionId);
  };

  const getOptionClassName = (optionId: string): string => {
    const baseClass = "w-full text-left p-4 rounded-lg border transition-all duration-200";
    
    if (showResults) {
      const isCorrect = isCorrectAnswer(optionId);
      const wasSelected = selectedOptions.includes(optionId);
      
      if (isCorrect && wasSelected) {
        return `${baseClass} border-green-500 bg-green-50 text-green-800`;
      } else if (isCorrect) {
        return `${baseClass} border-green-300 bg-green-25`;
      } else if (wasSelected) {
        return `${baseClass} border-red-500 bg-red-50 text-red-800`;
      } else {
        return `${baseClass} border-gray-200 bg-gray-50`;
      }
    }
    
    return selectedOptions.includes(optionId)
      ? `${baseClass} border-blue-500 bg-blue-50 shadow-sm`
      : `${baseClass} border-gray-200 hover:border-blue-300 hover:bg-gray-50`;
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            {timeLeft !== undefined && (
              <div className="flex items-center space-x-2">
                <Clock size={16} className={timeLeft < 30 ? "text-red-500" : "text-gray-500"} />
                <span className={`text-sm font-medium ${timeLeft < 30 ? "text-red-500" : ""}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-medium mb-4">{question.text}</h2>
          
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question"
              className="mb-4 rounded-lg max-h-64 mx-auto"
            />
          )}
        </div>
      </div>

      {/* Question Content by Type */}
      {(question.type === 'MultipleChoice' || question.type === 'TrueFalse') && (
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => !showResults && handleOptionSelect(option.id)}
              className={getOptionClassName(option.id)}
              disabled={showResults}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-5 h-5 mr-3">
                  {showResults && isCorrectAnswer(option.id) && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                  {showResults && selectedOptions.includes(option.id) && !isCorrectAnswer(option.id) && (
                    <XCircle size={20} className="text-red-600" />
                  )}
                  {!showResults && (
                    <div
                      className={`w-5 h-5 ${
                        question.type === 'MultipleChoice' ? 'rounded' : 'rounded-full'
                      } border mr-3 flex items-center justify-center transition-colors ${
                        selectedOptions.includes(option.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedOptions.includes(option.id) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  )}
                </div>
                <span className="font-medium">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {question.type === 'Matching' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Items to Match</h3>
            {question.matchingPairs?.map((pair) => (
              <div
                key={pair.id}
                draggable={!showResults}
                onDragStart={() => setDraggedItem(pair.left)}
                className={`p-3 border rounded-lg cursor-move ${
                  showResults ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {pair.left}
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Match With</h3>
            {question.matchingPairs?.map((pair) => (
              <div
                key={`target-${pair.id}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedItem && !showResults) {
                    handleMatchingDrop(draggedItem, pair.right);
                    setDraggedItem(null);
                  }
                }}
                className={`p-3 border-2 border-dashed rounded-lg min-h-[50px] flex items-center ${
                  Object.values(matchingAnswers).includes(pair.right)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <span className="text-gray-600">{pair.right}</span>
                {Object.values(matchingAnswers).includes(pair.right) && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ← {Object.keys(matchingAnswers).find(k => matchingAnswers[k] === pair.right)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {question.type === 'FillInBlank' && question.fillInBlanks?.[0] && (
        <div className="space-y-4">
          {renderFillInBlankText(
            question.fillInBlanks[0].text,
            question.fillInBlanks[0].blanks
          )}
        </div>
      )}

      {question.type === 'ShortAnswer' && (
        <div>
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => !showResults && handleTextChange(e.target.value)}
            className="input w-full"
            placeholder="Enter your answer"
            disabled={showResults}
          />
        </div>
      )}

      {question.type === 'Essay' && (
        <div>
          <textarea
            value={textAnswer}
            onChange={(e) => !showResults && handleTextChange(e.target.value)}
            className="input w-full min-h-[200px]"
            placeholder="Write your essay response here..."
            disabled={showResults}
          />
          <p className="text-sm text-gray-500 mt-2">
            This question will be manually graded by the quiz creator.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};