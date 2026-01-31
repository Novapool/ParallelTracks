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
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Live Results
        </h3>
        <p className="text-gray-500 text-center py-4">
          No votes yet. Be the first to vote!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Live Results
        </h3>
        <span className="text-sm text-gray-500">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
      <div className="space-y-4">
        {AI_MODELS.map((model) => {
          const count = getCountForModel(model);
          const percentage = getPercentage(count);

          return (
            <div key={model} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">
                  {AI_MODEL_LABELS[model]}
                </span>
                <span className="text-gray-600">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getBarColor(model)} transition-all duration-500 ease-out`}
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
