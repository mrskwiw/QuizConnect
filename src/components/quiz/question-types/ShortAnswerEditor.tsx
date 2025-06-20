import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';

import { Question } from '../../../types';

interface ShortAnswerEditorProps {
  correctAnswer: string;
  acceptableAnswers: string[];
  onUpdate: (field: keyof Question, value: Question[keyof Question]) => void;
  addAcceptableAnswer: () => void;
  updateAcceptableAnswer: (index: number, value: string) => void;
  removeAcceptableAnswer: (index: number) => void;
}

export const ShortAnswerEditor: React.FC<ShortAnswerEditorProps> = ({
  correctAnswer,
  acceptableAnswers,
  onUpdate,
  addAcceptableAnswer,
  updateAcceptableAnswer,
  removeAcceptableAnswer,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer *
        </label>
        <input
          type="text"
          value={correctAnswer || ''}
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
        {acceptableAnswers?.map((answer, index) => (
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
  );
};