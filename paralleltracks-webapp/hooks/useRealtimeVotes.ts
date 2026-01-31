'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { VoteCount, AIModel } from '@/types/app.types';

export function useRealtimeVotes(questionId: string | null, initialCounts: VoteCount[]) {
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>(initialCounts);

  useEffect(() => {
    setVoteCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    if (!questionId) return;

    const channel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          const newVote = payload.new as { ai_model: AIModel };

          setVoteCounts((prevCounts) => {
            const updated = [...prevCounts];
            const modelIndex = updated.findIndex(
              (vc) => vc.ai_model === newVote.ai_model
            );

            if (modelIndex >= 0) {
              updated[modelIndex] = {
                ...updated[modelIndex],
                count: updated[modelIndex].count + 1,
              };
            } else {
              updated.push({
                ai_model: newVote.ai_model,
                count: 1,
              });
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  return voteCounts;
}
