'use client';

import { AIModel } from '@/types/app.types';

interface AIResponsesProps {
  responses: Record<AIModel, string> | null;
  loading: boolean;
  error: string | null;
}

export function AIResponses({ responses, loading, error }: AIResponsesProps) {
  if (loading) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Getting AI responses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error: {error}</p>
      </div>
    );
  }

  if (!responses) {
    return null;
  }

  return (
    <div className="space-y-4">
      {Object.entries(responses).map(([model, response]) => (
        <div key={model} className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2 capitalize">{model}</h3>
          <p className="text-gray-800">{response}</p>
        </div>
      ))}
    </div>
  );
}
