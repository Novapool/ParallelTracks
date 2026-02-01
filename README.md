# ParallelTracks - Live AI Voting System

A real-time voting system for AI trolley problem answers using Supabase. Features AI-generated scenario images, voice personalities, auto-play audio with colored subtitles, and live vote tracking with a leaderboard.

## Overview

ParallelTracks allows users to vote on AI model responses to ethical dilemmas (trolley problems). The system supports 5 AI models, each with unique voice personalities:
- **Anthropic** (Claude) - Voice: Adam (Dominant, Firm)
- **GPT** (OpenAI) - Voice: Liam (Energetic, Social Media Creator)
- **Gemini** (Google) - Voice: Sarah (Mature, Reassuring, Confident)
- **Grok** (xAI) - Voice: George (Warm, Captivating Storyteller)
- **DeepSeek** - Voice: Brian (Deep, Resonant and Comforting)

## Key Features

- 🎨 **AI-Generated Scenario Images** - Visual illustrations created by Gemini for each question
- 🎤 **Voice Personalities** - Each AI model has a distinct ElevenLabs voice character
- 🔊 **Auto-play Audio** - Automatic sequential playback with colored subtitle overlays
- 📝 **Template-Based Input** - Structured question creation with two-outcome format
- 🗳️ **Real-time Voting** - Live vote counts via Supabase Realtime
- 🏆 **AI Leaderboard** - Track performance across all questions
- 🧹 **Automatic Cleanup** - Old audio files removed before each new question

## Quick Start

### Prerequisites

- Python 3.8+ (for host display)
- Node.js 18+ (for voting webapp)
- [Supabase account](https://supabase.com) with a project set up
- [OpenRouter API key](https://openrouter.ai/) (for AI responses and image generation)
- [ElevenLabs API key](https://elevenlabs.io/) (for text-to-speech voice synthesis)

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/Novapool/ParallelTracks.git
cd ParallelTracks
```

### 2. Setup Host Display (Game Screen)

The host display shows AI-generated scenario images, questions, model responses with colored cards, and auto-play audio with voice personalities.

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
2. **Create a scenario** via the admin form at http://localhost:8000
   - Fill in Outcome 1: "kill 5 innocent workers on the main track"
   - Fill in Outcome 2: "kill 1 innocent person on the side track"
   - Preview shows: "You must choose between two bad outcomes: allowing a runaway trolley to [outcome 1] or pulling a lever to divert it to a side track where it will [outcome 2]."
3. **Watch the magic happen**:
   - Gemini generates a sketch-style scenario image
   - All 5 AI models respond with ethical reasoning
   - ElevenLabs creates voice audio for each response
   - Colored cards display all responses
4. **Auto-play audio** - Click "Click Here to Start Auto-play" to hear all responses sequentially with colored subtitles
5. **Vote on webapp** - Open http://localhost:3000 and vote for your favorite response
6. **See live updates** - Vote counts update in real-time on both displays

### How It Works

1. **Admin creates scenario** → Fill template with two outcomes → Question sent to Supabase
2. **AI image generation** → Gemini creates a sketch-style illustration of the scenario
3. **AI responses** → All 5 models respond with their ethical reasoning (via OpenRouter)
4. **Voice synthesis** → Each response converted to audio using model's assigned ElevenLabs voice
5. **Display & playback** → Host shows colored cards, auto-plays audio with matching subtitle overlays
6. **Users vote** → Scan QR code or visit webapp → Vote for favorite AI response
7. **Live updates** → Supabase Realtime pushes vote counts to both host and webapp
8. **Leaderboard** → Track which AI model is winning over time

## Question Template Format

ParallelTracks uses a structured template for creating ethical dilemmas. This ensures consistency and helps users quickly understand the scenario:

**Template:**
> You must choose between two bad outcomes: allowing a runaway trolley to **[OUTCOME 1]** or pulling a lever to divert it to a side track where it will **[OUTCOME 2]**.

**Example:**
- **Outcome 1:** "kill 5 innocent workers on the main track"
- **Outcome 2:** "kill 1 innocent person on the side track"

**Generated Question:**
> You must choose between two bad outcomes: allowing a runaway trolley to kill 5 innocent workers on the main track or pulling a lever to divert it to a side track where it will kill 1 innocent person on the side track.

The admin interface includes a live preview that updates as you type, character counters (max 500 chars per outcome), and validation to ensure both outcomes are filled.

## AI Models & Voice Personalities

Each AI model has a unique voice personality to create a more engaging experience:

| AI Model | Voice Character | Personality | Color |
|----------|----------------|-------------|-------|
| **Anthropic (Claude)** | Adam | Dominant, Firm | Orange (#D97757) |
| **GPT (OpenAI)** | Liam | Energetic, Social Media Creator | Green (#10A37F) |
| **Gemini (Google)** | Sarah | Mature, Reassuring, Confident | Purple (#8E75F0) |
| **Grok (xAI)** | George | Warm, Captivating Storyteller | Blue (#1D9BF0) |
| **DeepSeek** | Brian | Deep, Resonant and Comforting | Blue (#4A90E2) |

**Voice synthesis powered by:** [ElevenLabs](https://elevenlabs.io/)
**Image generation powered by:** Google Gemini (Nano Banana Pro)

## Architecture

### Frontend Flow
1. **Template Input**: Admin fills two-outcome template → Question generated
2. **Visual Generation**: Gemini creates sketch-style scenario illustration
3. **AI Responses**: OpenRouter queries 5 models → Responses displayed in colored cards
4. **Voice Synthesis**: ElevenLabs generates audio with unique voice per model
5. **Game Display**: Shows scenario image + question + all 5 AI answers with auto-play audio
6. **Voting Interface**: Users scan QR → see question + voting buttons on mobile
7. **Real-time Updates**: Live vote counts displayed via Supabase Realtime
8. **Leaderboard**: Track AI model performance over time

### Backend Stack
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **API**: Supabase Edge Functions (Deno)
- **Authentication**: Anonymous + Service Role keys
- **AI Models**: OpenRouter API (Anthropic, OpenAI, Google, xAI, DeepSeek)
- **Image Generation**: Google Gemini via OpenRouter (Nano Banana Pro)
- **Text-to-Speech**: ElevenLabs API with voice personalities
- **Host Server**: Flask (Python) for game display
- **Voting Interface**: Next.js 14 (React, TypeScript, Tailwind CSS)

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
- Click "Click Here to Start Auto-play" to unlock audio in browser
- Check browser console for errors
- Ensure audio files are generated in `host-display/static/audio/`

**Image generation fails**
- Check `OPENROUTER_API_KEY` is valid and has credits
- Verify Gemini model is available on OpenRouter
- Check `host-display/static/images/` directory exists and is writable
- Look for image generation errors in Flask console logs

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
- Flask application with template-based scenario creation form
- AI image generation via Gemini (Nano Banana) for visual scenarios
- AI integration via OpenRouter (5 models: Anthropic, GPT, Gemini, Grok, DeepSeek)
- Text-to-speech via ElevenLabs with unique voice personalities per model
- Auto-play audio with colored subtitle overlays matching each model
- Automatic cleanup of old audio and image files
- Rate limiting (5 questions/hour) and security features
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

- ✅ **AI-Generated Images** - Scenario illustrations created by Gemini (Nano Banana)
- ✅ **Voice Personalities** - Each AI model has a unique ElevenLabs voice character
- ✅ **Auto-play Audio** - Sequential audio playback with colored subtitle overlays
- ✅ **Template-Based Questions** - Structured two-outcome scenario creation
- ✅ **Real-time Voting** - Live vote count updates via Supabase Realtime
- ✅ **Multi-AI Support** - 5 AI models respond to each question
- ✅ **Anonymous Voting** - Session-based voting with duplicate prevention
- ✅ **AI Leaderboard** - Track model performance across all questions
- ✅ **Mobile-Friendly** - Responsive voting interface for phones
- ✅ **Automatic Cleanup** - Old audio and image files managed automatically
- ✅ **Rate Limiting** - Security measures to prevent abuse

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
