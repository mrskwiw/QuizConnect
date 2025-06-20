import React from 'react';
import { QuestionOption } from '../../../types';

interface TrueFalseEditorProps {
  options: QuestionOption[];
  correctOptionIds: string[];
  toggleCorrectOption: (optionId: string) => void;
}

export const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({
  options,
  correctOptionIds,
  toggleCorrectOption,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Options *
      </label>
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <input
            type="radio"
            name={`question-${option.id}-correct`}
            checked={correctOptionIds.includes(option.id)}
            onChange={() => toggleCorrectOption(option.id)}
            className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <input
            type="text"
            value={option.text}
            className="input"
            disabled
          />
        </div>
      ))}
      <p className="text-xs text-gray-500">
        Select the correct answer
      </p>
    </div>
  );
};