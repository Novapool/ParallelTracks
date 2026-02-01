'use client';

import { Card } from '../ui/Card';
import { LeaderboardEntry } from '@/types/app.types';
import { AI_MODEL_LABELS } from '@/lib/constants';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const sortedEntries = [...entries].sort((a, b) => b.total_wins - a.total_wins);

  const getRankBadgeStyles = (rank: number): string => {
    if (rank === 1) return 'bg-[#ffd700] border-[#ffed4e] text-pixel-bg';
    if (rank === 2) return 'bg-[#c0c0c0] border-[#e8e8e8] text-pixel-bg';
    if (rank === 3) return 'bg-[#cd7f32] border-[#dd8f42] text-pixel-text';
    return 'bg-pixel-bg-tertiary border-pixel-text-secondary text-pixel-text-secondary';
  };

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry, index) => (
        <Card key={entry.ai_model} className="hover:border-pixel-accent transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 border-4 flex items-center justify-center ${getRankBadgeStyles(index + 1)}`}>
                <span className="text-lg font-pixel">
                  #{index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-pixel text-pixel-text">
                  {AI_MODEL_LABELS[entry.ai_model]}
                </h3>
                <p className="text-base font-retro text-pixel-text-secondary">
                  {entry.questions_answered} questions answered
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-pixel text-pixel-text">
                {entry.total_wins}
              </div>
              <div className="text-base font-retro text-pixel-text-secondary">
                wins
              </div>
              <div className="text-sm font-retro text-pixel-text-secondary mt-1">
                {entry.total_votes} total votes
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
