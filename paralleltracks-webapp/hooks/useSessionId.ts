'use client';

import { useState, useEffect } from 'react';
import { getOrCreateSessionId } from '@/lib/utils/session';

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  return sessionId;
}
