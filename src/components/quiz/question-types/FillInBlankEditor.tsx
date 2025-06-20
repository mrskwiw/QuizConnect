import React from 'react';
import { FillInBlank } from '../../../types';

interface FillInBlankEditorProps {
  fillInBlanks: FillInBlank[];
  updateFillInBlank: (field: 'text', value: string) => void;
  updateBlankAnswer: (blankIndex: number, field: 'correctAnswer', value: string) => void;
}

export const FillInBlankEditor: React.FC<FillInBlankEditorProps> = ({
  fillInBlanks,
  updateFillInBlank,
  updateBlankAnswer,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text with Blanks *
        </label>
        <textarea
          value={fillInBlanks?.[0]?.text || ''}
          onChange={(e) => updateFillInBlank('text', e.target.value)}
          className="input min-h-[80px]"
          placeholder="Enter text with {{blank}} markers where students should fill in answers"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Use {`{{blank}}`} to mark where students should fill in answers
        </p>
      </div>
      
      {fillInBlanks?.[0]?.blanks.map((blank, blankIndex) => (
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
  );
};