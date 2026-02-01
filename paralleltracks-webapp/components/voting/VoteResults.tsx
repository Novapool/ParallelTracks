'use client';

import { Card } from '../ui/Card';
import { VoteCount, AIModel } from '@/types/app.types';
import { AI_MODELS, AI_MODEL_LABELS } from '@/lib/constants';

interface VoteResultsProps {
  voteCounts: VoteCount[];
}

export function VoteResults({ voteCounts }: VoteResultsProps) {
  // Ensure voteCounts is always an array
  const safeVoteCounts = Array.isArray(voteCounts) ? voteCounts : [];
  const totalVotes = safeVoteCounts.reduce((sum, vc) => sum + vc.count, 0);

  const getCountForModel = (model: AIModel): number => {
    return safeVoteCounts.find((vc) => vc.ai_model === model)?.count || 0;
  };

  const getPercentage = (count: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getBarColor = (model: AIModel): string => {
    const colors: Record<AIModel, string> = {
      anthropic: 'bg-anthropic',
      gpt: 'bg-gpt',
      gemini: 'bg-gemini',
      grok: 'bg-grok',
      deepseek: 'bg-deepseek',
    };
    return colors[model];
  };

  if (totalVotes === 0) {
    return (
      <Card>
        <h3 className="text-base font-pixel text-pixel-accent mb-3">
          Live Results
        </h3>
        <p className="text-pixel-text-secondary font-retro text-center py-4">
          No votes yet. Be the first to vote!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-pixel text-pixel-accent">
          Live Results
        </h3>
        <span className="text-base font-retro text-pixel-text-secondary">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
      <div className="space-y-4">
        {AI_MODELS.map((model) => {
          const count = getCountForModel(model);
          const percentage = getPercentage(count);

          return (
            <div key={model} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-retro text-pixel-text">
                  {AI_MODEL_LABELS[model]}
                </span>
                <span className="font-retro text-pixel-text-secondary">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-pixel-bg-tertiary border-2 border-pixel-border h-4 overflow-hidden">
                <div
                  className={`h-full ${getBarColor(model)} border-r-2 border-pixel-border transition-all duration-300 ease-pixel`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
