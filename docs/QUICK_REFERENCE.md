# ParallelTracks Quick Reference

## 🚀 Quick Start

### Project Info
- **URL:** https://xihfenboeoypghatehhl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/xihfenboeoypghatehhl

### API Keys
```bash
# Anonymous Key (public - use in webapp)
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI"

# Service Role Key (secret - get from Supabase Dashboard)
SERVICE_ROLE_KEY="<from-dashboard>"
```

## 📋 AI Models
```
anthropic | gpt | gemini | grok | deepseek
```

## 🔌 API Endpoints

### 1. Get Current State
```bash
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H "Authorization: Bearer $ANON_KEY"
```

### 2. Create Question (Game Server)
```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"question_text": "Your trolley problem here..."}'
```

### 3. Submit Vote (Webapp)
```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H "Authorization: Bearer $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "question_id": "uuid-here",
    "ai_model": "anthropic",
    "voter_session_id": "session-uuid-here"
  }'
```

## 💻 JavaScript Examples

### Setup Supabase Client
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xihfenboeoypghatehhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
);
```

### Webapp: Get Session ID
```javascript
let sessionId = localStorage.getItem('voter_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('voter_session_id', sessionId);
}
```

### Webapp: Load Current State
```javascript
const response = await fetch(
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state',
  { headers: { 'Authorization': `Bearer ${ANON_KEY}` } }
);
const state = await response.json();
// state.active_question, state.vote_counts, state.leaderboard
```

### Webapp: Submit Vote
```javascript
const response = await fetch(
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_id: currentQuestionId,
      ai_model: 'anthropic',
      voter_session_id: sessionId
    })
  }
);
const result = await response.json();
// result.success, result.vote_id (or result.message if error)
```

### Game: Create Question
```javascript
const response = await fetch(
  'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question_text: trolleyProblem
    })
  }
);
const question = await response.json();
// question.question_id, question.question_text, question.status
```

### Game: Subscribe to Live Votes
```javascript
const votesChannel = supabase
  .channel('live-votes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'votes' },
    (payload) => {
      console.log('New vote:', payload.new);
      // payload.new.ai_model, payload.new.question_id
      updateVoteCount(payload.new.ai_model);
    }
  )
  .subscribe();
```

### Webapp: Subscribe to New Questions
```javascript
const questionsChannel = supabase
  .channel('active-questions')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'questions',
      filter: 'status=eq.active'
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        displayNewQuestion(payload.new);
      }
    }
  )
  .subscribe();
```

## 🗄️ Database Schema

### questions
```sql
id              uuid (PK)
question_text   text
status          text ('active' | 'completed')
created_at      timestamptz
ended_at        timestamptz (nullable)
```

### votes
```sql
id                 uuid (PK)
question_id        uuid (FK -> questions.id)
ai_model           text (anthropic|gpt|gemini|grok|deepseek)
voter_session_id   text
created_at         timestamptz

UNIQUE(question_id, voter_session_id)
```

### ai_leaderboard
```sql
id                   uuid (PK)
ai_model             text (unique)
total_wins           integer
total_votes          integer
questions_answered   integer
updated_at           timestamptz
```

## 🔒 Security

### RLS Policies
- ✅ **questions:** Public read, service role write
- ✅ **votes:** Public read & insert (anonymous voting)
- ✅ **ai_leaderboard:** Public read, service role write

### Key Rules
- ❌ Never expose service role key in client code
- ✅ Service role key = game server only
- ✅ Anonymous key = safe for webapp
- ✅ Session ID = `crypto.randomUUID()` (client-side)

## 🧪 Quick Test

```bash
# Test the API (no auth needed for GET)
curl 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' -s | jq

# Should return:
# {
#   "active_question": null,
#   "vote_counts": { all 0s },
#   "leaderboard": [ 5 AI models with 0 stats ]
# }
```

## 📚 Documentation Files

| File | Description |
|------|-------------|
| **API.md** | Complete API reference (26KB) |
| **TESTING.md** | Testing guide with 12 tests (15KB) |
| **README.md** | Project overview (7.2KB) |
| **database.types.ts** | TypeScript types (6.7KB) |
| **IMPLEMENTATION_SUMMARY.md** | What was built |
| **QUICK_REFERENCE.md** | This file |

## ❓ Common Errors

### "You have already voted on this question"
- Each session ID can only vote once per question
- This is by design (no duplicate votes)

### "Question is no longer active"
- A new question was created, closing the previous one
- Get current state to see the new active question

### "ai_model must be one of: ..."
- AI model must be exactly: `anthropic`, `gpt`, `gemini`, `grok`, or `deepseek`
- Case-sensitive

### "Unauthorized"
- Check you're using the correct API key
- Service role key for `create_new_question`
- Anonymous key for `submit_vote` and `get_current_state`

## 🎯 Workflow

### Game Flow
1. Generate trolley problem + get 5 AI answers
2. Call `create_new_question` with question_text
3. Display question + answers + QR code
4. Subscribe to Realtime votes table
5. Update live vote counts on screen
6. Move to next question → call `create_new_question` again

### Webapp Flow
1. Generate/retrieve session ID from localStorage
2. Call `get_current_state` on page load
3. Display question + 5 voting buttons
4. On button click → call `submit_vote`
5. Disable voting buttons after successful vote
6. (Optional) Subscribe to Realtime for live updates

## ⚡ Performance Tips

- Use Realtime subscriptions instead of polling
- Cache session ID in localStorage
- Batch operations when possible
- Use TypeScript types for autocomplete

## 🆘 Support

- 📖 See **API.md** for detailed API docs
- 🧪 See **TESTING.md** for testing procedures
- 🎯 See **README.md** for project overview
- 💻 Dashboard: https://supabase.com/dashboard/project/xihfenboeoypghatehhl

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Updated:** 2026-01-31
