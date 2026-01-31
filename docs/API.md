# ParallelTracks API Documentation

## Overview
This document describes the backend API for the ParallelTracks live AI voting system. The system uses Supabase for database, Realtime subscriptions, and Edge Functions.

## Project Setup

### Supabase Project URL
```
https://xihfenboeoypghatehhl.supabase.co
```

### API Keys

#### Anonymous Key (Public - for Webapp)
Use this key for public-facing webapp operations (voting, reading data):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
```

#### Service Role Key (Secret - for Game Server)
**WARNING: Never expose this key in client-side code!** Only use on your secure game server.

To get the service role key:
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the `service_role` key (it's a secret key)

### Installing Supabase Client (Optional)
For easier integration, install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

---

## AI Models
The system supports exactly 5 AI models:
- `anthropic` (Claude)
- `gpt` (OpenAI)
- `gemini` (Google)
- `grok` (xAI)
- `deepseek` (DeepSeek)

---

## Edge Functions API

### 1. Create New Question

**Endpoint:** `POST /functions/v1/create_new_question`

**Full URL:**
```
https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question
```

**Use Case:** Local game server creates a new question round

**Authentication:** Service role key required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <SERVICE_ROLE_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question_text": "A trolley is heading toward 5 people..."
}
```

**Response (200 OK):**
```json
{
  "question_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_text": "A trolley is heading toward 5 people...",
  "status": "active",
  "created_at": "2026-01-31T20:00:00.000Z"
}
```

**Behavior:**
- Automatically closes any previously active questions
- Tallies votes from previous question and updates leaderboard
- Creates new question with status='active'

**Example (curl):**
```bash
curl -X POST \
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "question_text": "A trolley is heading toward 5 people. You can pull a lever to divert it to a track with 1 person. What do you do?"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question_text: 'A trolley is heading toward 5 people...'
  })
});

const data = await response.json();
console.log('New question:', data);
```

---

### 2. Submit Vote

**Endpoint:** `POST /functions/v1/submit_vote`

**Full URL:**
```
https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote
```

**Use Case:** Webapp users submit their votes for an AI model

**Authentication:** Anonymous key (Bearer token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
Content-Type: application/json
```

**Request Body:**
```json
{
  "question_id": "550e8400-e29b-41d4-a716-446655440000",
  "ai_model": "anthropic",
  "voter_session_id": "client-generated-uuid-v4"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "vote_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Error Response (409 Conflict - Duplicate Vote):**
```json
{
  "success": false,
  "message": "You have already voted on this question"
}
```

**Error Response (400 Bad Request - Invalid Model):**
```json
{
  "success": false,
  "message": "ai_model must be one of: anthropic, gpt, gemini, grok, deepseek"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Question not found"
}
```

**Error Response (400 Bad Request - Inactive Question):**
```json
{
  "success": false,
  "message": "Question is no longer active"
}
```

**Example (curl):**
```bash
curl -X POST \
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d '{
    "question_id": "550e8400-e29b-41d4-a716-446655440000",
    "ai_model": "anthropic",
    "voter_session_id": "my-unique-session-id"
  }'
```

**Example (JavaScript):**
```javascript
// Generate or retrieve session ID
let sessionId = localStorage.getItem('voter_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('voter_session_id', sessionId);
}

const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question_id: 'current-question-id',
    ai_model: 'anthropic',
    voter_session_id: sessionId
  })
});

const result = await response.json();
if (result.success) {
  console.log('Vote submitted!');
} else {
  console.error('Error:', result.message);
}
```

---

### 3. Get Current State

**Endpoint:** `GET /functions/v1/get_current_state`

**Full URL:**
```
https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state
```

**Use Case:** Get complete current state for webapp/game initial load

**Authentication:** Anonymous key (Bearer token) or no auth required

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
```

**Response (200 OK):**
```json
{
  "active_question": {
    "question_id": "550e8400-e29b-41d4-a716-446655440000",
    "question_text": "A trolley is heading toward 5 people...",
    "status": "active",
    "created_at": "2026-01-31T20:00:00.000Z"
  },
  "vote_counts": {
    "anthropic": 12,
    "gpt": 8,
    "gemini": 5,
    "grok": 3,
    "deepseek": 2
  },
  "leaderboard": [
    {
      "ai_model": "anthropic",
      "total_wins": 5,
      "total_votes": 120,
      "questions_answered": 10
    },
    {
      "ai_model": "gpt",
      "total_wins": 3,
      "total_votes": 95,
      "questions_answered": 10
    },
    {
      "ai_model": "gemini",
      "total_wins": 2,
      "total_votes": 85,
      "questions_answered": 10
    },
    {
      "ai_model": "grok",
      "total_wins": 0,
      "total_votes": 50,
      "questions_answered": 10
    },
    {
      "ai_model": "deepseek",
      "total_wins": 0,
      "total_votes": 45,
      "questions_answered": 10
    }
  ]
}
```

**Response when no active question:**
```json
{
  "active_question": null,
  "vote_counts": {
    "anthropic": 0,
    "gpt": 0,
    "gemini": 0,
    "grok": 0,
    "deepseek": 0
  },
  "leaderboard": [...]
}
```

**Example (curl):**
```bash
curl -X GET \
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
```

**Example (JavaScript):**
```javascript
const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
  }
});

const state = await response.json();
console.log('Current state:', state);
```

---

## Realtime Subscriptions

Supabase Realtime allows you to subscribe to database changes in real-time. All three tables have Realtime enabled.

### Setup Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xihfenboeoypghatehhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Subscribe to Votes (For Game - Live Vote Counts)

```javascript
// Subscribe to vote changes for live vote count updates
const votesChannel = supabase
  .channel('votes-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'votes'
    },
    (payload) => {
      console.log('New vote received:', payload.new);

      // Update your UI with new vote
      // payload.new contains: { id, question_id, ai_model, voter_session_id, created_at }
      const aiModel = payload.new.ai_model;

      // Increment vote count for this AI model in your UI
      updateVoteCount(aiModel);
    }
  )
  .subscribe();

// Clean up when done
// votesChannel.unsubscribe();
```

### Subscribe to Questions (For Webapp - Active Question Changes)

```javascript
// Subscribe to active question changes
const questionsChannel = supabase
  .channel('questions-channel')
  .on(
    'postgres_changes',
    {
      event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'questions',
      filter: 'status=eq.active'
    },
    (payload) => {
      console.log('Question update:', payload);

      if (payload.eventType === 'INSERT') {
        // New question created
        console.log('New question:', payload.new);
        displayNewQuestion(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        // Question updated (e.g., status changed to 'completed')
        console.log('Question updated:', payload.new);
      }
    }
  )
  .subscribe();

// Clean up when done
// questionsChannel.unsubscribe();
```

### Subscribe to Leaderboard (For Webapp/Game - Leaderboard Updates)

```javascript
// Subscribe to leaderboard changes
const leaderboardChannel = supabase
  .channel('leaderboard-channel')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'ai_leaderboard'
    },
    (payload) => {
      console.log('Leaderboard updated:', payload.new);

      // Update leaderboard display
      updateLeaderboard(payload.new);
    }
  )
  .subscribe();

// Clean up when done
// leaderboardChannel.unsubscribe();
```

---

## Webapp Integration Guide

### 1. Generate Voter Session ID

Each user needs a unique session ID to prevent duplicate votes. Generate it once and store it in localStorage:

```javascript
function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('voter_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Generates a UUIDv4
    localStorage.setItem('voter_session_id', sessionId);
  }

  return sessionId;
}

const sessionId = getOrCreateSessionId();
```

### 2. Initial Load

On page load, fetch the current state:

```javascript
async function loadCurrentState() {
  const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state', {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
    }
  });

  const state = await response.json();

  if (state.active_question) {
    displayQuestion(state.active_question);
    displayVoteCounts(state.vote_counts);
  } else {
    showWaitingMessage();
  }

  displayLeaderboard(state.leaderboard);
}

loadCurrentState();
```

### 3. Display Voting UI

Show the question text and 5 voting buttons:

```html
<div id="voting-container">
  <h2 id="question-text"></h2>

  <div class="voting-buttons">
    <button onclick="vote('anthropic')">Claude (Anthropic)</button>
    <button onclick="vote('gpt')">GPT (OpenAI)</button>
    <button onclick="vote('gemini')">Gemini (Google)</button>
    <button onclick="vote('grok')">Grok (xAI)</button>
    <button onclick="vote('deepseek')">DeepSeek</button>
  </div>

  <div id="vote-feedback"></div>
</div>
```

### 4. Submit Vote

```javascript
async function vote(aiModel) {
  const sessionId = getOrCreateSessionId();
  const questionId = getCurrentQuestionId(); // Store this when you load the question

  const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_id: questionId,
      ai_model: aiModel,
      voter_session_id: sessionId
    })
  });

  const result = await response.json();

  if (result.success) {
    showSuccess('Vote submitted successfully!');
    disableVotingButtons(); // Prevent multiple votes
  } else {
    showError(result.message);
  }
}
```

### 5. Handle Errors

```javascript
function showError(message) {
  const feedback = document.getElementById('vote-feedback');
  feedback.textContent = message;
  feedback.className = 'error';

  // Common error messages to handle:
  // - "You have already voted on this question"
  // - "Question is no longer active"
}

function showSuccess(message) {
  const feedback = document.getElementById('vote-feedback');
  feedback.textContent = message;
  feedback.className = 'success';
}
```

### 6. Subscribe to Realtime Updates (Optional)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xihfenboeoypghatehhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
);

// Subscribe to new questions
supabase
  .channel('questions')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'questions' },
    (payload) => {
      if (payload.new.status === 'active') {
        displayNewQuestion(payload.new);
        enableVotingButtons();
      }
    }
  )
  .subscribe();
```

---

## Game Integration Guide

### 1. Create Question

When moving to a new question in your game:

```javascript
async function createNewQuestion(questionText) {
  const response = await fetch('https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${YOUR_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_text: questionText
    })
  });

  const question = await response.json();

  // Store question ID for later reference
  currentQuestionId = question.question_id;

  // Display on game screen
  displayQuestionOnScreen(question.question_text);

  return question;
}
```

### 2. Display on Game Screen

Your game should display:
- Question text
- All 5 AI answers (generated locally, not stored in DB)
- QR code linking to webapp
- Live vote counts (updated via Realtime)

### 3. Subscribe to Live Votes

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xihfenboeoypghatehhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
);

// Initialize vote counts
const voteCounts = {
  anthropic: 0,
  gpt: 0,
  gemini: 0,
  grok: 0,
  deepseek: 0
};

// Subscribe to vote changes
supabase
  .channel('game-votes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'votes' },
    (payload) => {
      const vote = payload.new;

      // Only count votes for current question
      if (vote.question_id === currentQuestionId) {
        voteCounts[vote.ai_model]++;
        updateVoteDisplay(voteCounts);
      }
    }
  )
  .subscribe();
```

### 4. Display Live Vote Counts

```javascript
function updateVoteDisplay(counts) {
  // Update your game UI with new vote counts
  // Example: show bars, numbers, or percentages next to each AI answer

  document.getElementById('anthropic-count').textContent = counts.anthropic;
  document.getElementById('gpt-count').textContent = counts.gpt;
  document.getElementById('gemini-count').textContent = counts.gemini;
  document.getElementById('grok-count').textContent = counts.grok;
  document.getElementById('deepseek-count').textContent = counts.deepseek;

  // Calculate percentages
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (total > 0) {
    updateVotePercentages(counts, total);
  }
}
```

### 5. Move to Next Question

When ready for the next question:

```javascript
async function nextQuestion(newQuestionText) {
  // Calling create_new_question automatically:
  // - Closes previous question
  // - Tallies votes
  // - Updates leaderboard
  await createNewQuestion(newQuestionText);

  // Reset vote counts for new question
  voteCounts.anthropic = 0;
  voteCounts.gpt = 0;
  voteCounts.gemini = 0;
  voteCounts.grok = 0;
  voteCounts.deepseek = 0;

  updateVoteDisplay(voteCounts);
}
```

---

## Database Schema

### Tables

#### `questions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_text | text | The trolley problem question |
| status | text | 'active' or 'completed' |
| created_at | timestamptz | When question was created |
| ended_at | timestamptz | When question was closed (nullable) |

#### `votes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_id | uuid | Foreign key to questions.id |
| ai_model | text | One of: anthropic, gpt, gemini, grok, deepseek |
| voter_session_id | text | Client-generated UUID to prevent duplicates |
| created_at | timestamptz | When vote was submitted |

**Unique constraint:** (question_id, voter_session_id)

#### `ai_leaderboard`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ai_model | text | One of: anthropic, gpt, gemini, grok, deepseek (unique) |
| total_wins | integer | Number of questions won |
| total_votes | integer | Total votes received across all questions |
| questions_answered | integer | Total questions participated in |
| updated_at | timestamptz | Last update timestamp |

---

## TypeScript Types

Save this as `database.types.ts` in your project:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_leaderboard: {
        Row: {
          ai_model: string
          id: string
          questions_answered: number
          total_votes: number
          total_wins: number
          updated_at: string
        }
        Insert: {
          ai_model: string
          id?: string
          questions_answered?: number
          total_votes?: number
          total_wins?: number
          updated_at?: string
        }
        Update: {
          ai_model?: string
          id?: string
          questions_answered?: number
          total_votes?: number
          total_wins?: number
          updated_at?: string
        }
      }
      questions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          question_text: string
          status: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          question_text: string
          status: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          question_text?: string
          status?: string
        }
      }
      votes: {
        Row: {
          ai_model: string
          created_at: string
          id: string
          question_id: string
          voter_session_id: string
        }
        Insert: {
          ai_model: string
          created_at?: string
          id?: string
          question_id: string
          voter_session_id: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          id?: string
          question_id?: string
          voter_session_id?: string
        }
      }
    }
  }
}
```

Usage with Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabase = createClient<Database>(
  'https://xihfenboeoypghatehhl.supabase.co',
  'YOUR_ANON_KEY'
);

// Now you get full TypeScript autocomplete and type safety
const { data, error } = await supabase
  .from('questions')
  .select('*')
  .eq('status', 'active')
  .single();
```

---

## Security Considerations

### Vote Spam Prevention
- Unique constraint on (question_id, voter_session_id) prevents duplicate votes
- Use `crypto.randomUUID()` to generate session IDs
- Store session ID in localStorage for persistence across page reloads

### Model Validation
- All endpoints validate that ai_model is one of the 5 valid models
- CHECK constraints in database enforce valid values

### Single Active Question
- `create_new_question` automatically closes previous active questions
- Enforced via application logic in Edge Function

### Service Role Key Security
- **NEVER** expose service role key in client-side code
- Only use on secure game server
- Only used for creating questions (write operations)

### Row Level Security (RLS)
All tables have RLS enabled:
- **questions**: Public read, service role write
- **votes**: Public read and insert (anonymous can vote)
- **ai_leaderboard**: Public read, service role write

---

## Error Handling

### Common Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid or missing API key) |
| 404 | Not Found (question doesn't exist) |
| 409 | Conflict (duplicate vote) |
| 500 | Internal Server Error |

### Best Practices

1. Always check response status before parsing JSON
2. Display user-friendly error messages
3. Handle network errors gracefully
4. Implement retry logic for transient errors
5. Log errors for debugging

```javascript
async function safeApiCall(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);

    // Show user-friendly message
    if (error.message.includes('already voted')) {
      showError('You have already voted on this question');
    } else if (error.message.includes('no longer active')) {
      showError('This question is no longer accepting votes');
    } else {
      showError('Something went wrong. Please try again.');
    }

    throw error;
  }
}
```

---

## Testing & Development

### Test the API with curl

1. **Create a question** (requires service role key):
```bash
curl -X POST \
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"question_text": "Test question"}'
```

2. **Get current state**:
```bash
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
```

3. **Submit a vote**:
```bash
curl -X POST \
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d '{"question_id": "QUESTION_ID_HERE", "ai_model": "anthropic", "voter_session_id": "test-session-1"}'
```

---

## Support & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xihfenboeoypghatehhl
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Realtime Docs**: https://supabase.com/docs/guides/realtime

---

## Quick Reference

### Project URL
```
https://xihfenboeoypghatehhl.supabase.co
```

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI
```

### AI Models
```
anthropic, gpt, gemini, grok, deepseek
```

### Endpoints
```
POST   /functions/v1/create_new_question  (service role)
POST   /functions/v1/submit_vote           (anon)
GET    /functions/v1/get_current_state     (anon)
```
