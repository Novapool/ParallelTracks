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
          <h2 className="text-sm font-pixel text-pixel-accent mb-4">
            Current Question
          </h2>
          <p className="text-xl font-retro text-pixel-text leading-relaxed cursor-blink">
            {question}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl font-retro text-pixel-text-secondary">
            Waiting for the next question...
          </p>
          <p className="text-base font-retro text-pixel-text-secondary mt-2">
            Check back soon!
          </p>
        </div>
      )}
    </Card>
  );
}
