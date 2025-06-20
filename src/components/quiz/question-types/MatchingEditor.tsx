import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { MatchingPair } from '../../../types';

interface MatchingEditorProps {
  matchingPairs: MatchingPair[];
  updateMatchingPair: (index: number, field: 'left' | 'right', value: string) => void;
  addMatchingPair: () => void;
  removeMatchingPair: (index: number) => void;
}

export const MatchingEditor: React.FC<MatchingEditorProps> = ({
  matchingPairs,
  updateMatchingPair,
  addMatchingPair,
  removeMatchingPair,
}) => {
  return (
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
      {matchingPairs?.map((pair, pairIndex) => (
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
          {matchingPairs!.length > 2 && (
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
  );
};