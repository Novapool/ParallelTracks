'use client';

import { useState, useEffect } from 'react';
import { getCurrentState } from '@/lib/supabase/api';
import { CurrentState } from '@/types/app.types';

export function useCurrentState() {
  const [state, setState] = useState<CurrentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchState() {
      try {
        setLoading(true);
        const data = await getCurrentState();
        setState(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load current state');
      } finally {
        setLoading(false);
      }
    }

    fetchState();
  }, []);

  return { state, loading, error, refreshState: async () => {
    const data = await getCurrentState();
    setState(data);
  }};
}
