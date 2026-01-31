import { supabase } from './client';
import { CurrentState, VoteSubmission, VoteResponse } from '@/types/app.types';

const FUNCTIONS_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

export async function getCurrentState(): Promise<CurrentState> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/get_current_state`, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch current state: ${response.statusText}`);
  }

  return response.json();
}

export async function submitVote(voteData: VoteSubmission): Promise<VoteResponse> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/submit_vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(voteData),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('You have already voted on this question');
    } else if (response.status === 400) {
      throw new Error('This question is no longer active');
    } else if (response.status === 404) {
      throw new Error('Question not found');
    }
    throw new Error(data.message || 'Failed to submit vote');
  }

  return data;
}
