export type AIModel = 'anthropic' | 'gpt' | 'gemini' | 'grok' | 'deepseek';

export interface ActiveQuestion {
  id: string;
  question: string;
  status: string;
}

export interface VoteCount {
  ai_model: AIModel;
  count: number;
}

export interface LeaderboardEntry {
  ai_model: AIModel;
  total_wins: number;
  total_votes: number;
  questions_answered: number;
}

export interface CurrentState {
  active_question: ActiveQuestion | null;
  vote_counts: VoteCount[];
  leaderboard: LeaderboardEntry[];
}

export interface VoteSubmission {
  question_id: string;
  ai_model: AIModel;
  voter_session_id: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  vote?: {
    id: string;
    question_id: string;
    ai_model: AIModel;
    voter_session_id: string;
    created_at: string;
  };
}
