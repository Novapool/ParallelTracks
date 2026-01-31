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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            ParallelTracks
          </h1>
          <p className="text-gray-600">
            Vote on AI responses to trolley problems
          </p>
          <Link
            href="/leaderboard"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
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
