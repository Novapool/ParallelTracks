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
  anthropic: 'bg-anthropic hover:bg-[#C56847] text-white',
  gpt: 'bg-gpt hover:bg-[#639A8C] text-white',
  gemini: 'bg-gemini hover:bg-[#3275E4] text-white',
  grok: 'bg-grok hover:bg-[#1a1a1a] text-white',
  deepseek: 'bg-deepseek hover:bg-[#5356E1] text-white'
};
