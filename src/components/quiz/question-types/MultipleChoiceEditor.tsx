import React from 'react';
import { QuestionOption } from '../../../types';

interface MultipleChoiceEditorProps {
  options: QuestionOption[];
  correctOptionIds: string[];
  toggleCorrectOption: (optionId: string) => void;
  updateOption: (index: number, value: string) => void;
}

export const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({
  options,
  correctOptionIds,
  toggleCorrectOption,
  updateOption,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Options *
      </label>
      {options.map((option, optionIndex) => (
        <div key={option.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            name={`question-${option.id}-correct`}
            checked={correctOptionIds.includes(option.id)}
            onChange={() => toggleCorrectOption(option.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <input
            type="text"
            value={option.text}
            onChange={(e) => updateOption(optionIndex, e.target.value)}
            className="input"
            placeholder={`Option ${optionIndex + 1}`}
            required
          />
        </div>
      ))}
      <p className="text-xs text-gray-500">
        Check the box next to correct answer(s)
      </p>
    </div>
  );
};