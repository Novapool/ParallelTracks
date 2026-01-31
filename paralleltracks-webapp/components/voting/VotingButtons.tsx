'use client';

import { AI_MODELS, AI_MODEL_LABELS, AI_MODEL_COLORS } from '@/lib/constants';
import { AIModel } from '@/types/app.types';

interface VotingButtonsProps {
  onVote: (model: AIModel) => void;
  disabled: boolean;
  submitting: boolean;
}

export function VotingButtons({ onVote, disabled, submitting }: VotingButtonsProps) {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Which AI gave the best response?
      </h3>
      <div className="grid gap-3">
        {AI_MODELS.map((model) => (
          <button
            key={model}
            onClick={() => onVote(model)}
            disabled={disabled || submitting}
            className={`
              min-h-[56px] px-6 py-4 rounded-lg font-semibold text-lg
              transition-all duration-200 transform active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              ${AI_MODEL_COLORS[model]}
              shadow-md hover:shadow-lg
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Voting...
              </span>
            ) : (
              AI_MODEL_LABELS[model]
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
