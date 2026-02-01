# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParallelTracks is a real-time voting system for AI trolley problem answers. The system consists of three main components:

1. **Host Display** (Flask/Python) - Game screen showing questions, AI responses, and TTS audio
2. **Voting Webapp** (Next.js 14/TypeScript) - Mobile-first voting interface
3. **Backend** (Supabase) - PostgreSQL database with Edge Functions and Realtime

## Development Commands

### Host Display (Flask Application)

```bash
# Navigate to host display directory
cd host-display

# Install dependencies
pip3 install -r requirements.txt

# Run development server (port 8000)
python3 app.py

# Clean up old audio files
python3 cleanup_audio.py --hours 24
```

**Environment setup:** Copy `.env.example` to `.env` and configure:
- `OPENROUTER_API_KEY` - For AI model responses
- `ELEVENLABS_API_KEY` - For text-to-speech
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` - For database access

### Voting Webapp (Next.js Application)

```bash
# Navigate to webapp directory
cd paralleltracks-webapp

# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

**Environment setup:** Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### System Flow

1. Admin submits question via host display → Creates question in Supabase
2. Host display queries 5 AI models via OpenRouter → Displays responses with colored cards
3. ElevenLabs generates TTS audio → Audio files saved to `host-display/static/audio/`
4. Users vote via webapp (scan QR code) → Votes stored in Supabase
5. Supabase Realtime broadcasts vote updates → Both apps update in real-time
6. Question closes → Leaderboard tallied via SQL function

### Host Display (Port 8000)

**Key files:**
- `app.py` - Flask routes, rate limiting, security
- `ai_backend.py` - OpenRouter integration for 5 AI models
- `cleanup_audio.py` - Audio file cleanup utility
- `templates/display.html` - Main display page
- `static/` - CSS, JS, images, and generated audio files

**AI Model Integration:**
- Uses OpenRouter API with 5 models: `anthropic`, `gpt`, `gemini`, `grok`, `deepseek`
- Model mapping in `MODEL_MAPPING` dict (must match backend)
- Generates TTS via ElevenLabs and serves audio files

**Security features:**
- Rate limiting: 5 questions/hour per IP
- Path traversal protection for audio files
- Environment variable validation on startup
- Input validation (10-5000 chars)

### Voting Webapp (Port 3000)

**Directory structure:**
- `app/` - Next.js App Router pages (page.tsx, layout.tsx)
- `components/` - React components organized by feature
  - `voting/` - Question display, voting buttons, results, status
  - `ui/` - Reusable Card and Button components
- `hooks/` - Custom React hooks for state management
  - `useSessionId.ts` - Client session ID (localStorage)
  - `useCurrentState.ts` - Fetch current question/votes
  - `useVoteSubmission.ts` - Submit votes
  - `useRealtimeVotes.ts` - Subscribe to live vote updates
- `lib/` - Utilities and API client
  - `supabase/client.ts` - Supabase client config
  - `supabase/api.ts` - API functions (getCurrentState, submitVote)
  - `utils/session.ts` - Vote tracking in localStorage
  - `constants.ts` - AI model names and colors
- `types/` - TypeScript definitions
  - `app.types.ts` - Application types
  - `database.types.ts` - Supabase-generated types

**Real-time Implementation:**
- Subscribes to `votes` table for live vote counts
- Subscribes to `questions` table for new active questions
- Custom hooks encapsulate Realtime logic

### Backend (Supabase)

**Database Schema:**

Tables:
- `questions` - Stores questions with status ('active' or 'completed')
- `votes` - User votes with unique constraint on (question_id, voter_session_id)
- `ai_leaderboard` - Aggregate stats (total_wins, total_votes, questions_answered)

**Edge Functions** (Deno, deployed to Supabase):
- `create_new_question` - Creates question, closes previous, tallies votes
- `submit_vote` - Handles voting with duplicate prevention
- `get_current_state` - Returns active question, vote counts, leaderboard

**SQL Functions:**
- `tally_votes_and_update_leaderboard` - Aggregates results when question closes

**Note:** Supabase functions are deployed separately and not in this repo. Use Supabase CLI or dashboard to view/edit.

## Key Patterns

### AI Model Names
The 5 AI models use consistent lowercase identifiers across all systems:
- `anthropic` (Claude)
- `gpt` (OpenAI)
- `gemini` (Google)
- `grok` (xAI)
- `deepseek` (DeepSeek)

**Model mapping must stay in sync** between:
- `host-display/ai_backend.py` - Maps to OpenRouter model IDs
- `paralleltracks-webapp/lib/constants.ts` - Defines model colors
- Supabase Edge Functions - Validates model names
- Database constraints - Enforces valid models

### Vote Deduplication
Anonymous voting prevents duplicates via:
1. Client generates `voter_session_id` (UUID stored in localStorage)
2. Database has unique constraint on `(question_id, voter_session_id)`
3. Client tracks votes in localStorage: `voted_{questionId}=true`
4. UI disables buttons after voting

### Real-time Updates
Both applications use Supabase Realtime:
- Subscribe to table changes via WebSocket
- Update UI reactively without polling
- Handle connection lifecycle in custom hooks

### Error Handling
Webapp API layer (`lib/supabase/api.ts`) translates HTTP status codes:
- 409 → "Already voted"
- 400 → "Question no longer active"
- 404 → "Question not found"

## Environment Configuration

### Required API Keys

**Host Display (.env):**
- `OPENROUTER_API_KEY` - Get from https://openrouter.ai/
- `ELEVENLABS_API_KEY` - Get from https://elevenlabs.io/
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard → Settings → API

**Webapp (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL` - Same as above
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard → Settings → API

**Security:** Never commit `.env` or `.env.local` files. Use `.env.example` templates.

## Testing

### Full Integration Test
1. Start host display: `cd host-display && python3 app.py`
2. Start webapp: `cd paralleltracks-webapp && npm run dev`
3. Submit question at http://localhost:8000
4. Vote at http://localhost:3000
5. Verify real-time updates on both apps

### API Testing
```bash
# Get current state
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# Submit vote
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"question_id":"uuid","ai_model":"anthropic","voter_session_id":"uuid"}'
```

See `docs/TESTING.md` for comprehensive testing guide.

## Common Issues

**"Missing required environment variables"**
- Copy `.env.example` to `.env` (host) or `.env.local` (webapp)
- Verify all keys are set

**Port conflicts**
- Host display defaults to 8000 (avoids macOS AirPlay on 5000)
- Webapp defaults to 3000
- Set `PORT` env var to change

**Audio files accumulating**
- Run `cleanup_audio.py --hours 24` to delete old files
- Consider setting up cron job for automatic cleanup

**Type errors in webapp**
- Run `npm run build` to check TypeScript errors
- Database types are in `types/database.types.ts`
- Regenerate from Supabase schema if needed

## Deployment

**Host Display:**
- Use Gunicorn: `gunicorn -w 4 -b 0.0.0.0:8000 app:app`
- Disable Flask debug mode (remove `FLASK_DEBUG` env var)
- Setup audio cleanup cron job
- Secure `.env` file (chmod 600)

**Webapp:**
- Build: `npm run build`
- Deploy to Vercel (recommended)
- Set environment variables in Vercel dashboard
- Automatic deployments on git push

## Documentation

Comprehensive docs in `docs/` directory:
- `QUICK_REFERENCE.md` - Quick start and cheat sheet
- `API.md` - Complete API documentation
- `TESTING.md` - Testing procedures
- `IMPLEMENTATION_SUMMARY.md` - Implementation status
- `database.types.ts` - TypeScript types for Supabase

## Project URLs

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xihfenboeoypghatehhl
- **API Base:** https://xihfenboeoypghatehhl.supabase.co
- **Local Host Display:** http://localhost:8000
- **Local Webapp:** http://localhost:3000
