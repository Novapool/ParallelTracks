import { AIModel } from '@/types/app.types';

export const AI_MODELS: readonly AIModel[] = ['anthropic', 'gpt', 'gemini', 'grok', 'deepseek'] as const;

export const AI_MODEL_LABELS: Record<AIModel, string> = {
  anthropic: 'Claude',
  gpt: 'ChatGPT',
  gemini: 'Gemini',
  grok: 'Grok',
  deepseek: 'DeepSeek'
};

export const AI_MODEL_COLORS: Record<AIModel, string> = {
  anthropic: 'bg-anthropic border-4 border-anthropic-dark text-pixel-text hover:shadow-glow-anthropic',
  gpt: 'bg-gpt border-4 border-gpt-dark text-pixel-text hover:shadow-glow-gpt',
  gemini: 'bg-gemini border-4 border-gemini-dark text-pixel-bg hover:shadow-glow-gemini',
  grok: 'bg-grok border-4 border-grok-dark text-pixel-text hover:shadow-glow-grok',
  deepseek: 'bg-deepseek border-4 border-deepseek-dark text-pixel-text hover:shadow-glow-deepseek'
};
