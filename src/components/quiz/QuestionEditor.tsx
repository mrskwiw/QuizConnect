import React, { useState } from 'react';
import { Trash2, GripVertical, Image, Clock, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { SubscriptionGate } from '../subscription/SubscriptionGate';
import { Question, QuestionType, SubscriptionTier } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  MultipleChoiceEditor,
  TrueFalseEditor,
  MatchingEditor,
  FillInBlankEditor,
  ShortAnswerEditor,
} from './question-types';

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  onUpdate: (field: keyof Question, value: Question[keyof Question]) => void;
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
  restrictedTypes,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const handleTypeChange = (newType: QuestionType) => {
    if (restrictedTypes.includes(newType)) {
      return;
    }

    onUpdate('type', newType);
    
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
        break;
    }
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text: value };
    onUpdate('options', newOptions);
  };

  const toggleCorrectOption = (optionId: string) => {
    const newCorrectOptionIds = [...(question.correctOptionIds || [])];
    
    if (question.type === 'MultipleChoice') {
      if (newCorrectOptionIds.includes(optionId)) {
        onUpdate('correctOptionIds', newCorrectOptionIds.filter(id => id !== optionId));
      } else {
        onUpdate('correctOptionIds', [...newCorrectOptionIds, optionId]);
      }
    } else {
      onUpdate('correctOptionIds', [optionId]);
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
    const newPairs = question.matchingPairs?.filter((_, i: number) => i !== pairIndex) || [];
    onUpdate('matchingPairs', newPairs);
  };

  const updateFillInBlank = (field: 'text', value: string) => {
    const fillInBlank = question.fillInBlanks?.[0] || { id: '1', text: '', blanks: [] };
    const updated = { ...fillInBlank, [field]: value };
    
    const blankMatches = value.match(/\{\{blank\}\}/g) || [];
    const blanks = blankMatches.map((_, index: number) => ({
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
    const current = question.acceptableAnswers?.filter((_: string, i: number) => i !== index) || [];
    onUpdate('acceptableAnswers', current);
  };

  const isRestrictedType = (type: QuestionType) => restrictedTypes.includes(type);

  const renderRestrictedTypeOption = (type: QuestionType, label: string) => (
    <option value={type} disabled>
      {label} (Pro Feature)
    </option>
  );

  const renderQuestionEditor = () => {
    switch (question.type) {
      case 'MultipleChoice':
        return (
          <MultipleChoiceEditor
            options={question.options || []}
            correctOptionIds={question.correctOptionIds || []}
            toggleCorrectOption={toggleCorrectOption}
            updateOption={updateOption}
          />
        );
      case 'TrueFalse':
        return (
          <TrueFalseEditor
            options={question.options || []}
            correctOptionIds={question.correctOptionIds || []}
            toggleCorrectOption={toggleCorrectOption}
          />
        );
      case 'Matching':
        return (
          <MatchingEditor
            matchingPairs={question.matchingPairs || []}
            updateMatchingPair={updateMatchingPair}
            addMatchingPair={addMatchingPair}
            removeMatchingPair={removeMatchingPair}
          />
        );
      case 'FillInBlank':
        return (
          <FillInBlankEditor
            fillInBlanks={question.fillInBlanks || []}
            updateFillInBlank={updateFillInBlank}
            updateBlankAnswer={updateBlankAnswer}
          />
        );
      case 'ShortAnswer':
        return (
          <ShortAnswerEditor
            correctAnswer={question.correctAnswer || ''}
            acceptableAnswers={question.acceptableAnswers || []}
            onUpdate={onUpdate}
            addAcceptableAnswer={addAcceptableAnswer}
            updateAcceptableAnswer={updateAcceptableAnswer}
            removeAcceptableAnswer={removeAcceptableAnswer}
          />
        );
      case 'Essay':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Essay Question:</strong> This question will be manually graded.
              Students can write extended responses, and you'll need to review and score them individually.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text *
          </label>
          <textarea
            value={question.text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate('text', e.target.value)}
            className="input min-h-[80px]"
            placeholder="Enter your question"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTypeChange(e.target.value as QuestionType)}
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

        {renderQuestionEditor()}

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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate('imageUrl', e.target.value)}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
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