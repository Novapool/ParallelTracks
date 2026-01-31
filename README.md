# ParallelTracks - Live AI Voting System

A real-time voting system for AI trolley problem answers using Supabase. Single lobby, anonymous voting, with live updates and AI leaderboard tracking.

## Overview

ParallelTracks allows users to vote on AI model responses to ethical dilemmas (trolley problems). The system supports 5 AI models:
- **Anthropic** (Claude)
- **GPT** (OpenAI)
- **Gemini** (Google)
- **Grok** (xAI)
- **DeepSeek** (DeepSeek)

## Architecture

### Frontend Flow
1. **Local Game Display**: Shows question + all 5 AI answers + QR code
2. **Webapp**: Users scan QR → see question + voting buttons
3. **Real-time Updates**: Live vote counts displayed on game screen via Supabase Realtime
4. **Leaderboard**: Track AI model performance over time

### Backend Stack
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **API**: Supabase Edge Functions (Deno)
- **Authentication**: Anonymous + Service Role keys

## Database Schema

### Tables

#### `questions`
Stores all questions (past and current).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_text | text | The trolley problem question |
| status | text | 'active' or 'completed' |
| created_at | timestamptz | When question was created |
| ended_at | timestamptz | When question was closed (nullable) |

#### `votes`
Stores user votes (anonymous, one per session per question).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_id | uuid | Foreign key to questions.id |
| ai_model | text | One of: anthropic, gpt, gemini, grok, deepseek |
| voter_session_id | text | Client-generated UUID to prevent duplicates |
| created_at | timestamptz | When vote was submitted |

**Unique constraint:** (question_id, voter_session_id)

#### `ai_leaderboard`
Aggregate statistics for each AI model.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ai_model | text | One of: anthropic, gpt, gemini, grok, deepseek (unique) |
| total_wins | integer | Number of questions won |
| total_votes | integer | Total votes received across all questions |
| questions_answered | integer | Total questions participated in |
| updated_at | timestamptz | Last update timestamp |

## API Endpoints

### 1. Create New Question
**POST** `/functions/v1/create_new_question`

Creates a new question and automatically closes any active questions, tallying votes and updating the leaderboard.

**Authentication:** Service role key (game server only)

**Request:**
```json
{
  "question_text": "A trolley is heading toward 5 people..."
}
```

**Response:**
```json
{
  "question_id": "uuid",
  "question_text": "...",
  "status": "active",
  "created_at": "2026-01-31T..."
}
```

### 2. Submit Vote
**POST** `/functions/v1/submit_vote`

Submit a user vote for an AI model.

**Authentication:** Anonymous key (public)

**Request:**
```json
{
  "question_id": "uuid",
  "ai_model": "anthropic",
  "voter_session_id": "client-generated-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "vote_id": "uuid"
}
```

### 3. Get Current State
**GET** `/functions/v1/get_current_state`

Get complete current state (active question, vote counts, leaderboard).

**Authentication:** Anonymous key (public)

**Response:**
```json
{
  "active_question": {
    "question_id": "uuid",
    "question_text": "...",
    "status": "active",
    "created_at": "..."
  },
  "vote_counts": {
    "anthropic": 12,
    "gpt": 8,
    "gemini": 5,
    "grok": 3,
    "deepseek": 2
  },
  "leaderboard": [...]
}
```

## Security Features

- **Vote Spam Prevention**: Unique constraint on (question_id, voter_session_id)
- **Model Validation**: Only 5 valid AI models accepted
- **Single Active Question**: Enforced via application logic
- **Row Level Security (RLS)**: All tables have RLS enabled
  - Public read access for all tables
  - Public insert access for votes (anonymous voting)
  - Service role required for creating questions and updating leaderboard

## Real-time Subscriptions

All tables have Realtime enabled for live updates:

- **votes**: Game subscribes for live vote counts
- **questions**: Webapp subscribes for active question changes
- **ai_leaderboard**: Both subscribe for leaderboard updates

## Documentation

- **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)**: Quick start guide and cheat sheet
- **[docs/API.md](docs/API.md)**: Complete API documentation with examples
- **[docs/TESTING.md](docs/TESTING.md)**: Comprehensive testing guide
- **[docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)**: Implementation details and status
- **[docs/database.types.ts](docs/database.types.ts)**: TypeScript types for Supabase integration
- **README.md**: This file

## Getting Started

### For Game Developers

1. Get the service role key from Supabase Dashboard
2. Use `create_new_question` to start a new question round
3. Display question + AI answers + QR code on screen
4. Subscribe to `votes` table via Realtime for live vote counts
5. Move to next question by calling `create_new_question` again

### For Webapp Developers

1. Generate voter session ID: `crypto.randomUUID()` (store in localStorage)
2. On load: Call `get_current_state` to fetch active question
3. Display question text + 5 voting buttons
4. On vote: Call `submit_vote` with question_id, ai_model, session_id
5. (Optional) Subscribe to Realtime for live vote updates

## Project URLs

- **Supabase Project**: https://supabase.com/dashboard/project/xihfenboeoypghatehhl
- **API Base URL**: https://xihfenboeoypghatehhl.supabase.co

## Development

### Prerequisites

- Supabase account
- Service role key (for testing question creation)
- Anonymous key (for testing voting)

### Testing

See **[docs/TESTING.md](docs/TESTING.md)** for comprehensive testing guide.

Quick test:
```bash
# Get current state
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
```

## Implementation Status

✅ **Phase 1**: Database Setup
- Tables: questions, votes, ai_leaderboard
- Foreign keys and constraints
- Indexes on frequently queried columns

✅ **Phase 2**: Realtime & RLS
- Realtime enabled on all tables
- RLS policies configured
- Security advisors reviewed

✅ **Phase 3**: SQL Functions
- `tally_votes_and_update_leaderboard` function

✅ **Phase 4**: Edge Functions
- `create_new_question` (service role)
- `submit_vote` (anonymous)
- `get_current_state` (anonymous)

✅ **Phase 5**: Initialize Data
- Leaderboard initialized with 5 AI models

✅ **Phase 6**: TypeScript Types
- docs/database.types.ts generated

✅ **Phase 7**: API Documentation
- docs/API.md with complete examples
- docs/TESTING.md with verification steps

## Next Steps

1. **Game Implementation**: Build local game display with QR code generation
2. **Webapp Implementation**: Build voting interface with Realtime subscriptions
3. **AI Integration**: Connect to actual AI APIs to generate answers
4. **UI/UX**: Design voting interface and game display
5. **Analytics**: Add vote analytics and visualization

## Support

For issues or questions:
- Check **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** for quick start
- Check **[docs/API.md](docs/API.md)** for API documentation
- Check **[docs/TESTING.md](docs/TESTING.md)** for testing procedures
- Review Supabase Dashboard for database issues
- Consult Supabase documentation: https://supabase.com/docs

## License

MIT License (or your preferred license)

---

Built with ❤️ using Supabase
