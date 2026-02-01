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
      <h3 className="text-base font-pixel text-pixel-accent mb-3">
        Which AI gave the best response?
      </h3>
      <div className="grid gap-3">
        {AI_MODELS.map((model) => (
          <button
            key={model}
            onClick={() => onVote(model)}
            disabled={disabled || submitting}
            className={`
              min-h-[56px] px-6 py-4 font-pixel shadow-pixel-sm
              transition-all duration-200 active:translate-y-[3px] active:shadow-none
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
              ${AI_MODEL_COLORS[model]}
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <span className="pixel-loading mr-3">
                  <div></div>
                  <div></div>
                  <div></div>
                </span>
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
