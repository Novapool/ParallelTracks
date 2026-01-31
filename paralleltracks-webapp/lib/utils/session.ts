export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('voter_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('voter_session_id', sessionId);
  }
  return sessionId;
}

export function hasVotedOnQuestion(questionId: string): boolean {
  if (typeof window === 'undefined') return false;

  const votedQuestions = localStorage.getItem('voted_questions');
  if (!votedQuestions) return false;

  const votedIds = JSON.parse(votedQuestions) as string[];
  return votedIds.includes(questionId);
}

export function markQuestionAsVoted(questionId: string): void {
  if (typeof window === 'undefined') return;

  const votedQuestions = localStorage.getItem('voted_questions');
  const votedIds = votedQuestions ? JSON.parse(votedQuestions) as string[] : [];

  if (!votedIds.includes(questionId)) {
    votedIds.push(questionId);
    localStorage.setItem('voted_questions', JSON.stringify(votedIds));
  }
}
