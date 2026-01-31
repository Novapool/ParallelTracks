'use client';

import { useState } from 'react';
import { submitVote } from '@/lib/supabase/api';
import { AIModel } from '@/types/app.types';
import { markQuestionAsVoted } from '@/lib/utils/session';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useVoteSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (questionId: string, aiModel: AIModel, sessionId: string) => {
    try {
      setStatus('submitting');
      setError(null);

      await submitVote({
        question_id: questionId,
        ai_model: aiModel,
        voter_session_id: sessionId,
      });

      markQuestionAsVoted(questionId);
      setStatus('success');

      // Reset success status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      setStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, 5000);
    }
  };

  return { submitVote: submit, status, error };
}
