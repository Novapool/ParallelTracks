'use client';

import { Card } from '../ui/Card';

interface QuestionDisplayProps {
  question: string | null;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <Card className="mb-6">
      {question ? (
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            Current Question
          </h2>
          <p className="text-xl md:text-2xl text-gray-900 leading-relaxed">
            {question}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl md:text-2xl text-gray-500">
            Waiting for the next question...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Check back soon!
          </p>
        </div>
      )}
    </Card>
  );
}
