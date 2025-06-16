import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Image, Clock, Crown, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { SubscriptionGate } from '../subscription/SubscriptionGate';
import { QuestionType, MatchingPair, FillInBlank, BlankAnswer, SubscriptionTier } from '../../types';
import { useNavigate } from 'react-router-dom';

interface QuestionData {
  text: string;
  type: QuestionType;
  options: string[];
  correctOptions: number[];
  imageUrl?: string;
  timeLimit?: number;
  matchingPairs?: MatchingPair[];
  fillInBlanks?: FillInBlank[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
}

interface QuestionEditorProps {
  question: QuestionData;
  questionIndex: number;
  onUpdate: (field: keyof QuestionData, value: any) => void;
  onRemove: () => void;
  userTier: SubscriptionTier;
  restrictedTypes: string[];
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  onUpdate,
  onRemove,
  userTier,
  restrictedTypes
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const handleTypeChange = (newType: QuestionType) => {
    // Check if type is restricted
    if (restrictedTypes.includes(newType)) {
      return; // Don't change type if restricted
    }

    onUpdate('type', newType);
    
    // Reset type-specific fields
    switch (newType) {
      case 'MultipleChoice':
        onUpdate('options', ['', '', '', '']);
        onUpdate('correctOptions', []);
        break;
      case 'TrueFalse':
        onUpdate('options', ['True', 'False']);
        onUpdate('correctOptions', []);
        break;
      case 'Matching':
        onUpdate('matchingPairs', [
          { id: '1', left: '', right: '' },
          { id: '2', left: '', right: '' }
        ]);
        break;
      case 'FillInBlank':
        onUpdate('fillInBlanks', [{
          id: '1',
          text: 'The capital of France is {{blank}}.',
          blanks: [{ id: '1', position: 0, correctAnswer: '', acceptableAnswers: [] }]
        }]);
        break;
      case 'ShortAnswer':
        onUpdate('correctAnswer', '');
        onUpdate('acceptableAnswers', []);
        break;
      case 'Essay':
        // Essay questions don't need specific setup
        break;
    }
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate('options', newOptions);
  };

  const toggleCorrectOption = (optionIndex: number) => {
    const newCorrectOptions = [...question.correctOptions];
    
    if (question.type === 'MultipleChoice') {
      if (newCorrectOptions.includes(optionIndex)) {
        onUpdate('correctOptions', newCorrectOptions.filter(i => i !== optionIndex));
      } else {
        onUpdate('correctOptions', [...newCorrectOptions, optionIndex]);
      }
    } else {
      onUpdate('correctOptions', [optionIndex]);
    }
  };

  const updateMatchingPair = (pairIndex: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...(question.matchingPairs || [])];
    newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };
    onUpdate('matchingPairs', newPairs);
  };

  const addMatchingPair = () => {
    const newPairs = [...(question.matchingPairs || [])];
    newPairs.push({ id: Date.now().toString(), left: '', right: '' });
    onUpdate('matchingPairs', newPairs);
  };

  const removeMatchingPair = (pairIndex: number) => {
    const newPairs = question.matchingPairs?.filter((_, i) => i !== pairIndex) || [];
    onUpdate('matchingPairs', newPairs);
  };

  const updateFillInBlank = (field: 'text', value: string) => {
    const fillInBlank = question.fillInBlanks?.[0] || { id: '1', text: '', blanks: [] };
    const updated = { ...fillInBlank, [field]: value };
    
    // Auto-detect blanks in text
    const blankMatches = value.match(/\{\{blank\}\}/g) || [];
    const blanks = blankMatches.map((_, index) => ({
      id: (index + 1).toString(),
      position: index,
      correctAnswer: fillInBlank.blanks[index]?.correctAnswer || '',
      acceptableAnswers: fillInBlank.blanks[index]?.acceptableAnswers || []
    }));
    
    updated.blanks = blanks;
    onUpdate('fillInBlanks', [updated]);
  };

  const updateBlankAnswer = (blankIndex: number, field: 'correctAnswer', value: string) => {
    const fillInBlank = question.fillInBlanks?.[0];
    if (!fillInBlank) return;
    
    const newBlanks = [...fillInBlank.blanks];
    newBlanks[blankIndex] = { ...newBlanks[blankIndex], [field]: value };
    
    const updated = { ...fillInBlank, blanks: newBlanks };
    onUpdate('fillInBlanks', [updated]);
  };

  const addAcceptableAnswer = () => {
    const current = question.acceptableAnswers || [];
    onUpdate('acceptableAnswers', [...current, '']);
  };

  const updateAcceptableAnswer = (index: number, value: string) => {
    const current = [...(question.acceptableAnswers || [])];
    current[index] = value;
    onUpdate('acceptableAnswers', current);
  };

  const removeAcceptableAnswer = (index: number) => {
    const current = question.acceptableAnswers?.filter((_, i) => i !== index) || [];
    onUpdate('acceptableAnswers', current);
  };

  const isRestrictedType = (type: QuestionType) => restrictedTypes.includes(type);

  const renderRestrictedTypeOption = (type: QuestionType, label: string) => (
    <option value={type} disabled>
      {label} (Pro Feature)
    </option>
  );

  // If current question type is restricted, show upgrade gate
  if (isRestrictedType(question.type)) {
    return (
      <SubscriptionGate
        feature="Advanced Question Types"
        description="Matching, Fill-in-the-blank, Short Answer, and Essay questions are available with Pro subscription."
        requiredTier="pro"
        currentTier={userTier}
        onUpgrade={() => navigate('/pricing')}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
          Question {questionIndex + 1}
        </CardTitle>
        <Button
          type="button"
          onClick={onRemove}
          variant="ghost"
          icon={<Trash2 size={18} />}
        >
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text *
          </label>
          <textarea
            value={question.text}
            onChange={(e) => onUpdate('text', e.target.value)}
            className="input min-h-[80px]"
            placeholder="Enter your question"
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="input"
            required
          >
            <option value="MultipleChoice">Multiple Choice</option>
            <option value="TrueFalse">True/False</option>
            {isRestrictedType('Matching') ? 
              renderRestrictedTypeOption('Matching', 'Matching') :
              <option value="Matching">Matching</option>
            }
            {isRestrictedType('FillInBlank') ? 
              renderRestrictedTypeOption('FillInBlank', 'Fill in the Blank') :
              <option value="FillInBlank">Fill in the Blank</option>
            }
            {isRestrictedType('ShortAnswer') ? 
              renderRestrictedTypeOption('ShortAnswer', 'Short Answer') :
              <option value="ShortAnswer">Short Answer</option>
            }
            {isRestrictedType('Essay') ? 
              renderRestrictedTypeOption('Essay', 'Essay') :
              <option value="Essay">Essay</option>
            }
          </select>
          {userTier === 'free' && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Crown size={12} className="mr-1" />
              Upgrade to Pro for advanced question types
            </p>
          )}
        </div>

        {/* Question Type Specific Content */}
        {(question.type === 'MultipleChoice' || question.type === 'TrueFalse') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Options *
            </label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type={question.type === 'MultipleChoice' ? 'checkbox' : 'radio'}
                  name={`question-${questionIndex}-correct`}
                  checked={question.correctOptions.includes(optionIndex)}
                  onChange={() => toggleCorrectOption(optionIndex)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  className="input"
                  placeholder={`Option ${optionIndex + 1}`}
                  required
                  disabled={question.type === 'TrueFalse'}
                />
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Check the box next to correct answer(s)
            </p>
          </div>
        )}

        {question.type === 'Matching' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Matching Pairs *
              </label>
              <Button
                type="button"
                onClick={addMatchingPair}
                variant="secondary"
                size="sm"
                icon={<Plus size={16} />}
              >
                Add Pair
              </Button>
            </div>
            {question.matchingPairs?.map((pair, pairIndex) => (
              <div key={pair.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => updateMatchingPair(pairIndex, 'left', e.target.value)}
                  className="input flex-1"
                  placeholder="Left side"
                  required
                />
                <span className="text-gray-400">↔</span>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => updateMatchingPair(pairIndex, 'right', e.target.value)}
                  className="input flex-1"
                  placeholder="Right side"
                  required
                />
                {question.matchingPairs!.length > 2 && (
                  <Button
                    type="button"
                    onClick={() => removeMatchingPair(pairIndex)}
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} />}
                  />
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Students will drag items from the left to match with items on the right
            </p>
          </div>
        )}

        {question.type === 'FillInBlank' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text with Blanks *
              </label>
              <textarea
                value={question.fillInBlanks?.[0]?.text || ''}
                onChange={(e) => updateFillInBlank('text', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Enter text with {{blank}} markers where students should fill in answers"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {`{{blank}}`} to mark where students should fill in answers
              </p>
            </div>
            
            {question.fillInBlanks?.[0]?.blanks.map((blank, blankIndex) => (
              <div key={blank.id} className="border border-gray-200 rounded p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blank {blankIndex + 1} - Correct Answer *
                </label>
                <input
                  type="text"
                  value={blank.correctAnswer}
                  onChange={(e) => updateBlankAnswer(blankIndex, 'correctAnswer', e.target.value)}
                  className="input"
                  placeholder="Enter the correct answer"
                  required
                />
              </div>
            ))}
          </div>
        )}

        {question.type === 'ShortAnswer' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer *
              </label>
              <input
                type="text"
                value={question.correctAnswer || ''}
                onChange={(e) => onUpdate('correctAnswer', e.target.value)}
                className="input"
                placeholder="Enter the correct answer"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alternative Acceptable Answers
                </label>
                <Button
                  type="button"
                  onClick={addAcceptableAnswer}
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={16} />}
                >
                  Add Alternative
                </Button>
              </div>
              {question.acceptableAnswers?.map((answer, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateAcceptableAnswer(index, e.target.value)}
                    className="input flex-1"
                    placeholder="Alternative correct answer"
                  />
                  <Button
                    type="button"
                    onClick={() => removeAcceptableAnswer(index)}
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} />}
                  />
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Add alternative spellings or phrasings that should be accepted as correct
              </p>
            </div>
          </div>
        )}

        {question.type === 'Essay' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Essay Question:</strong> This question will be manually graded. 
              Students can write extended responses, and you'll need to review and score them individually.
            </p>
          </div>
        )}

        {/* Advanced Options */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Image URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={question.imageUrl || ''}
                      onChange={(e) => onUpdate('imageUrl', e.target.value)}
                      className="input flex-1"
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      icon={<Image size={16} />}
                      disabled
                    >
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Add an image to accompany this question
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (seconds)
                  </label>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-400" />
                    <input
                      type="number"
                      value={question.timeLimit || ''}
                      onChange={(e) => onUpdate('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input flex-1"
                      placeholder="No limit"
                      min="10"
                      max="300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Override quiz time limit for this question
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};