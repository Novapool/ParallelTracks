'use client';

interface VotingStatusProps {
  status: 'idle' | 'submitting' | 'success' | 'error';
  error: string | null;
}

export function VotingStatus({ status, error }: VotingStatusProps) {
  if (status === 'idle' || status === 'submitting') {
    return null;
  }

  if (status === 'success') {
    return (
      <div className="mb-6 p-4 bg-[#0f3d28] border-4 border-pixel-success text-pixel-success font-retro">
        <div className="flex items-center">
          <span className="text-2xl mr-2">✓</span>
          <p>Vote submitted successfully!</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mb-6 p-4 bg-[#3d0f28] border-4 border-pixel-error text-pixel-error font-retro">
        <div className="flex items-center">
          <span className="text-2xl mr-2">✕</span>
          <p>{error || 'Failed to submit vote'}</p>
        </div>
      </div>
    );
  }

  return null;
}
