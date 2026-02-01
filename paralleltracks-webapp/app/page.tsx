'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QuestionDisplay } from '@/components/voting/QuestionDisplay';
import { VotingButtons } from '@/components/voting/VotingButtons';
import { VoteResults } from '@/components/voting/VoteResults';
import { VotingStatus } from '@/components/voting/VotingStatus';
import { useSessionId } from '@/hooks/useSessionId';
import { useCurrentState } from '@/hooks/useCurrentState';
import { useVoteSubmission } from '@/hooks/useVoteSubmission';
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes';
import { hasVotedOnQuestion } from '@/lib/utils/session';
import { AIModel } from '@/types/app.types';

export default function VotingPage() {
  const sessionId = useSessionId();
  const { state, loading, error } = useCurrentState();
  const { submitVote, status, error: submitError } = useVoteSubmission();
  const [hasVoted, setHasVoted] = useState(false);

  const questionId = state?.active_question?.id || null;
  const initialVoteCounts = Array.isArray(state?.vote_counts) ? state.vote_counts : [];
  const voteCounts = useRealtimeVotes(
    questionId,
    initialVoteCounts
  );

  useEffect(() => {
    if (questionId) {
      setHasVoted(hasVotedOnQuestion(questionId));
    }
  }, [questionId]);

  const handleVote = async (model: AIModel) => {
    if (!questionId || !sessionId || hasVoted) return;

    await submitVote(questionId, model, sessionId);
    setHasVoted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pixel-loading mb-4 text-pixel-accent">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-pixel-text-secondary font-retro text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#3d0f28] border-4 border-pixel-error p-6 max-w-md">
          <p className="text-pixel-error font-retro text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-pixel text-pixel-text mb-4">
            ParallelTracks
          </h1>
          <p className="text-lg font-retro text-pixel-text-secondary mb-4">
            Vote on AI responses to trolley problems
          </p>
          <Link
            href="/leaderboard"
            className="inline-block text-pixel-accent hover:brightness-110 font-retro text-lg"
          >
            View Leaderboard →
          </Link>
        </div>

        <QuestionDisplay question={state?.active_question?.question || null} />

        <VotingStatus status={status} error={submitError} />

        {state?.active_question && (
          <>
            <VotingButtons
              onVote={handleVote}
              disabled={!sessionId || hasVoted}
              submitting={status === 'submitting'}
            />
            <VoteResults voteCounts={voteCounts} />
          </>
        )}
      </div>
    </div>
  );
}
