'use client';

import { Card } from '../ui/Card';
import { LeaderboardEntry } from '@/types/app.types';
import { AI_MODEL_LABELS } from '@/lib/constants';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const sortedEntries = [...entries].sort((a, b) => b.total_wins - a.total_wins);

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry, index) => (
        <Card key={entry.ai_model} className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">
                  #{index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {AI_MODEL_LABELS[entry.ai_model]}
                </h3>
                <p className="text-sm text-gray-500">
                  {entry.questions_answered} questions answered
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {entry.total_wins}
              </div>
              <div className="text-sm text-gray-500">
                wins
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {entry.total_votes} total votes
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
