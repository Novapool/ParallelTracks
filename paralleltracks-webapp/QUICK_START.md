# Quick Start Guide

## Installation

```bash
cd paralleltracks-webapp
npm install
```

## Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Project Structure

```
paralleltracks-webapp/
├── app/
│   ├── page.tsx              # Voting page (/)
│   ├── layout.tsx            # Root layout
│   └── leaderboard/
│       └── page.tsx          # Leaderboard (/leaderboard)
├── components/
│   ├── voting/               # Voting UI components
│   ├── leaderboard/          # Leaderboard UI components
│   └── ui/                   # Reusable UI components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and API client
└── types/                    # TypeScript types
```

## Key Files

- `.env.local` - Environment variables
- `tailwind.config.js` - Tailwind CSS config (includes AI colors)
- `lib/constants.ts` - AI models configuration
- `lib/supabase/api.ts` - API wrapper functions
- `types/app.types.ts` - Application types

## API Endpoints

### Get Current State
```typescript
GET /functions/v1/get_current_state

Response: {
  active_question: { id, question, status } | null,
  vote_counts: [{ ai_model, count }, ...],
  leaderboard: [{ ai_model, total_wins, total_votes, questions_answered }, ...]
}
```

### Submit Vote
```typescript
POST /functions/v1/submit_vote

Body: {
  question_id: string,
  ai_model: 'anthropic' | 'gpt' | 'gemini' | 'grok' | 'deepseek',
  voter_session_id: string
}

Response: {
  success: boolean,
  message: string,
  vote?: { id, question_id, ai_model, voter_session_id, created_at }
}

Status Codes:
- 200: Success
- 400: Question inactive
- 404: Question not found
- 409: Already voted
```

## Real-time Subscriptions

### Votes Table
```typescript
supabase
  .channel('votes-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'votes',
    filter: `question_id=eq.${questionId}`
  }, (payload) => {
    // Handle new vote
  })
  .subscribe()
```

### Questions Table
```typescript
supabase
  .channel('questions-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'questions',
    filter: 'status=eq.active'
  }, (payload) => {
    // Handle new question
  })
  .subscribe()
```

## AI Model Configuration

```typescript
const AI_MODELS = ['anthropic', 'gpt', 'gemini', 'grok', 'deepseek'];

const AI_MODEL_LABELS = {
  anthropic: 'Claude',
  gpt: 'ChatGPT',
  gemini: 'Gemini',
  grok: 'Grok',
  deepseek: 'DeepSeek'
};

const AI_MODEL_COLORS = {
  anthropic: '#D97757',
  gpt: '#74AA9C',
  gemini: '#4285F4',
  grok: '#000000',
  deepseek: '#6366F1'
};
```

## localStorage Usage

```typescript
// Session ID (UUID)
localStorage.getItem('voter_session_id')

// Voted questions (array of question IDs)
localStorage.getItem('voted_questions')
// Example: ["uuid-1", "uuid-2", ...]
```

## Common Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Clear build cache
rm -rf .next
```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xihfenboeoypghatehhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Type errors
```bash
# Check types
npx tsc --noEmit
```

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Backend API Reference](../docs/API.md)
