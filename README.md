# ParallelTracks - Live AI Voting System

A real-time voting system for AI trolley problem answers using Supabase. Single lobby, anonymous voting, with live updates and AI leaderboard tracking.

## Overview

ParallelTracks allows users to vote on AI model responses to ethical dilemmas (trolley problems). The system supports 5 AI models:
- **Anthropic** (Claude)
- **GPT** (OpenAI)
- **Gemini** (Google)
- **Grok** (xAI)
- **DeepSeek** (DeepSeek)

## Quick Start

### Prerequisites

- Python 3.8+ (for host display)
- Node.js 18+ (for voting webapp)
- [Supabase account](https://supabase.com) with a project set up
- [OpenRouter API key](https://openrouter.ai/) (for AI responses)
- [ElevenLabs API key](https://elevenlabs.io/) (for text-to-speech)

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/ParallelTracks.git
cd ParallelTracks
```

### 2. Setup Host Display (Game Screen)

The host display shows questions, AI responses, and audio playback on a large screen.

```bash
# Navigate to host display
cd host-display

# Install Python dependencies
pip3 install -r requirements.txt

# Copy environment template and configure
cp .env.example .env
```

**Edit `host-display/.env` and add your API keys:**

- `OPENROUTER_API_KEY`: Get from [OpenRouter](https://openrouter.ai/)
- `ELEVENLABS_API_KEY`: Get from [ElevenLabs](https://elevenlabs.io/)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: From [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/xihfenboeoypghatehhl/settings/api)

**Run the host display:**

```bash
python3 app.py
```

Open http://localhost:8000 to see the game display.

### 3. Setup Voting Webapp (User Interface)

The webapp allows users to vote on AI responses via their phones.

```bash
# Navigate to webapp (from project root)
cd paralleltracks-webapp

# Install Node dependencies
npm install

# Copy environment template and configure
cp .env.example .env.local
```

**Edit `paralleltracks-webapp/.env.local` and add:**

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/xihfenboeoypghatehhl/settings/api)

**Run the webapp:**

```bash
npm run dev
```

Open http://localhost:3000 to see the voting interface.

### 4. Test the Full Flow

1. **Start both applications** (host display on :8000, webapp on :3000)
2. **Submit a question** via the admin form at http://localhost:8000
   - Example: "Should you flip the switch to save five people at the cost of one?"
3. **Watch AI responses generate** - All 5 models will respond with colored cards
4. **Play audio responses** - Click play buttons to hear TTS with colored subtitles
5. **Vote on webapp** - Open http://localhost:3000 and vote for your favorite response
6. **See live updates** - Vote counts update in real-time on the host display

### How It Works

1. **Admin submits question** → Question sent to Supabase → AI models generate responses
2. **Responses displayed** → Host display shows all 5 AI responses with colored cards
3. **Text-to-speech** → ElevenLabs converts responses to audio files
4. **Users vote** → Scan QR code (or visit webapp) → Vote for favorite AI response
5. **Live updates** → Supabase Realtime pushes vote counts to host display
6. **Leaderboard** → Track which AI model is winning over time

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

## API Integration Guide

If you're building custom integrations or want to understand the API layer:

### For Game/Display Developers

When building custom game displays:

1. **Get API keys** from Supabase Dashboard (service role key)
2. **Create questions** via `POST /functions/v1/create_new_question`
3. **Subscribe to votes** via Supabase Realtime for live vote counts
4. **Display AI responses** with colored cards matching each model
5. **Handle audio playback** using the generated TTS files

See [host-display/README.md](host-display/README.md) for implementation details.

### For Webapp/Client Developers

When building custom voting interfaces:

1. **Generate session ID**: `crypto.randomUUID()` and store in localStorage
2. **Fetch active question**: `GET /functions/v1/get_current_state`
3. **Display voting UI** with 5 buttons (one per AI model)
4. **Submit votes**: `POST /functions/v1/submit_vote` with question_id, ai_model, session_id
5. **Subscribe to Realtime** (optional) for live vote updates

See [paralleltracks-webapp/README.md](paralleltracks-webapp/README.md) for implementation details.

## Project URLs

- **Supabase Project**: https://supabase.com/dashboard/project/xihfenboeoypghatehhl
- **API Base URL**: https://xihfenboeoypghatehhl.supabase.co

## Development

See the **[Quick Start](#quick-start)** section above for setup instructions.

### Running in Development Mode

**Host Display:**
```bash
cd host-display
python3 app.py  # Runs on http://localhost:8000
```

**Voting Webapp:**
```bash
cd paralleltracks-webapp
npm run dev  # Runs on http://localhost:3000
```

### Testing

See **[docs/TESTING.md](docs/TESTING.md)** for comprehensive testing guide.

**Quick API test:**
```bash
# Get current state (replace with your anon key)
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Troubleshooting

**"Missing required environment variables"**
- Ensure you've copied `.env.example` to `.env` (host-display) or `.env.local` (webapp)
- Verify all required API keys are set in your `.env` files

**"Failed to submit question to Supabase"**
- Check your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify your Supabase project is active

**"Error querying AI models"**
- Verify your `OPENROUTER_API_KEY` is valid
- Check OpenRouter account has credits

**Audio doesn't play**
- Verify `ELEVENLABS_API_KEY` is set correctly
- Check browser console for errors
- Ensure audio files are generated in `host-display/static/audio/`

**Port conflicts**
- Host display uses port 8000 (set `PORT=` in .env to change)
- Webapp uses port 3000 (Next.js default)

## Implementation Status

### Backend (Supabase)

✅ **Database Setup**
- Tables: questions, votes, ai_leaderboard with proper constraints
- Row Level Security (RLS) policies configured
- Realtime enabled for live updates

✅ **Edge Functions**
- `create_new_question` - Creates questions and closes previous ones
- `submit_vote` - Handles anonymous voting with spam prevention
- `get_current_state` - Returns active question, vote counts, and leaderboard

✅ **SQL Functions**
- `tally_votes_and_update_leaderboard` - Aggregates results when questions close

### Frontend Applications

✅ **Host Display (host-display/)**
- Flask application with admin form for submitting questions
- AI integration via OpenRouter (5 models: Anthropic, GPT, Gemini, Grok, DeepSeek)
- Text-to-speech via ElevenLabs with colored subtitles
- Audio playback with automatic file cleanup
- Rate limiting and security features
- Environment-based configuration (.env)

✅ **Voting Webapp (paralleltracks-webapp/)**
- Next.js application with Supabase integration
- Anonymous voting with session ID tracking
- Real-time vote count updates
- Responsive mobile-first design
- QR code generation for easy mobile access

### Documentation

✅ **Complete Documentation**
- API reference (docs/API.md)
- Testing guide (docs/TESTING.md)
- Quick reference (docs/QUICK_REFERENCE.md)
- TypeScript types (docs/database.types.ts)
- README with quick start guide

## Features

- ✅ Real-time voting and live vote count updates
- ✅ Multi-AI model support (5 models)
- ✅ Text-to-speech audio generation with colored subtitles
- ✅ Anonymous voting with spam prevention
- ✅ Leaderboard tracking across all questions
- ✅ Mobile-friendly voting interface
- ✅ Admin question submission form
- ✅ Automatic audio file cleanup
- ✅ Rate limiting and security measures

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
