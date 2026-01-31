# ParallelTracks Testing Guide

This document provides step-by-step instructions for testing the ParallelTracks backend system.

## Prerequisites

You'll need:
- The **service role key** from Supabase Dashboard (for testing create_new_question)
- `curl` or similar HTTP client
- `jq` for JSON formatting (optional but recommended)

## Getting the Service Role Key

1. Go to: https://supabase.com/dashboard/project/xihfenboeoypghatehhl/settings/api
2. Copy the **service_role** key (secret key)
3. Set it as an environment variable for easy testing:

```bash
export SERVICE_ROLE_KEY="your-service-role-key-here"
```

## Test 1: Get Initial State

Verify the system is initialized correctly with no active questions:

```bash
curl -X GET 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -s | jq
```

**Expected Output:**
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
  "leaderboard": [
    {
      "ai_model": "anthropic",
      "total_wins": 0,
      "total_votes": 0,
      "questions_answered": 0
    },
    ...
  ]
}
```

✅ **Pass Criteria:** `active_question` is null, all vote counts are 0, leaderboard has 5 AI models with 0 stats.

---

## Test 2: Create First Question

Create a new question using the service role key:

```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "question_text": "A trolley is heading toward 5 people tied to the track. You can pull a lever to divert it to another track with 1 person. What do you do?"
  }' \
  -s | jq
```

**Expected Output:**
```json
{
  "question_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_text": "A trolley is heading toward 5 people...",
  "status": "active",
  "created_at": "2026-01-31T20:30:00.000Z"
}
```

✅ **Pass Criteria:** Response includes question_id, status is "active", question_text matches input.

**Save the question_id for next tests:**
```bash
export QUESTION_ID="<question_id_from_response>"
```

---

## Test 3: Verify Active Question

Get current state again to confirm the question is active:

```bash
curl -X GET 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -s | jq
```

✅ **Pass Criteria:** `active_question` is not null and matches the question you just created.

---

## Test 4: Submit Votes

Submit 10 votes with different session IDs and AI models:

### Vote 1-3: Anthropic (3 votes)
```bash
for i in {1..3}; do
  curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
    -H 'Content-Type: application/json' \
    -d "{
      \"question_id\": \"$QUESTION_ID\",
      \"ai_model\": \"anthropic\",
      \"voter_session_id\": \"test-session-$i\"
    }" \
    -s | jq
  echo "---"
done
```

### Vote 4-6: GPT (3 votes)
```bash
for i in {4..6}; do
  curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
    -H 'Content-Type: application/json' \
    -d "{
      \"question_id\": \"$QUESTION_ID\",
      \"ai_model\": \"gpt\",
      \"voter_session_id\": \"test-session-$i\"
    }" \
    -s | jq
  echo "---"
done
```

### Vote 7-8: Gemini (2 votes)
```bash
for i in {7..8}; do
  curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
    -H 'Content-Type: application/json' \
    -d "{
      \"question_id\": \"$QUESTION_ID\",
      \"ai_model\": \"gemini\",
      \"voter_session_id\": \"test-session-$i\"
    }" \
    -s | jq
  echo "---"
done
```

### Vote 9: Grok (1 vote)
```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d "{
    \"question_id\": \"$QUESTION_ID\",
    \"ai_model\": \"grok\",
    \"voter_session_id\": \"test-session-9\"
  }" \
  -s | jq
```

### Vote 10: DeepSeek (1 vote)
```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d "{
    \"question_id\": \"$QUESTION_ID\",
    \"ai_model\": \"deepseek\",
    \"voter_session_id\": \"test-session-10\"
  }" \
  -s | jq
```

✅ **Pass Criteria:** Each vote returns `{"success": true, "vote_id": "..."}`.

---

## Test 5: Verify Vote Counts

Check that vote counts are correct:

```bash
curl -X GET 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -s | jq '.vote_counts'
```

**Expected Output:**
```json
{
  "anthropic": 3,
  "gpt": 3,
  "gemini": 2,
  "grok": 1,
  "deepseek": 1
}
```

✅ **Pass Criteria:** Vote counts match: anthropic=3, gpt=3, gemini=2, grok=1, deepseek=1.

---

## Test 6: Test Duplicate Vote Prevention

Try to vote again with the same session ID:

```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d "{
    \"question_id\": \"$QUESTION_ID\",
    \"ai_model\": \"anthropic\",
    \"voter_session_id\": \"test-session-1\"
  }" \
  -s | jq
```

**Expected Output:**
```json
{
  "success": false,
  "message": "You have already voted on this question"
}
```

✅ **Pass Criteria:** Returns error with message about already voting.

---

## Test 7: Create Second Question (Close First & Tally Votes)

Create a second question, which should automatically:
1. Close the first question
2. Tally votes from the first question
3. Update the leaderboard

```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/create_new_question' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "question_text": "You see a person drowning. Saving them requires risking your own life. What do you do?"
  }' \
  -s | jq
```

**Save the new question_id:**
```bash
export QUESTION_ID_2="<new_question_id_from_response>"
```

✅ **Pass Criteria:** New question created successfully with status "active".

---

## Test 8: Verify First Question is Completed

Check that the first question now has status='completed' and ended_at is set:

```bash
curl -X GET 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -s | jq '.active_question'
```

✅ **Pass Criteria:** The active_question is now the second question (new question_id).

---

## Test 9: Verify Leaderboard Updated

Check that the leaderboard was updated correctly:

```bash
curl -X GET 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/get_current_state' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -s | jq '.leaderboard'
```

**Expected Output (anthropic and gpt tied, so either could win):**

If anthropic won (or tied and came first alphabetically):
```json
[
  {
    "ai_model": "anthropic",
    "total_wins": 1,
    "total_votes": 3,
    "questions_answered": 1
  },
  {
    "ai_model": "gpt",
    "total_wins": 0,
    "total_votes": 3,
    "questions_answered": 1
  },
  {
    "ai_model": "gemini",
    "total_wins": 0,
    "total_votes": 2,
    "questions_answered": 1
  },
  {
    "ai_model": "grok",
    "total_wins": 0,
    "total_votes": 1,
    "questions_answered": 1
  },
  {
    "ai_model": "deepseek",
    "total_wins": 0,
    "total_votes": 1,
    "questions_answered": 1
  }
]
```

✅ **Pass Criteria:**
- One model has `total_wins: 1` (the model with the most votes)
- `total_votes` matches vote counts: anthropic=3, gpt=3, gemini=2, grok=1, deepseek=1
- All models have `questions_answered: 1`

---

## Test 10: Test Invalid AI Model

Try to vote with an invalid AI model:

```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d "{
    \"question_id\": \"$QUESTION_ID_2\",
    \"ai_model\": \"chatgpt\",
    \"voter_session_id\": \"test-session-invalid\"
  }" \
  -s | jq
```

**Expected Output:**
```json
{
  "success": false,
  "message": "ai_model must be one of: anthropic, gpt, gemini, grok, deepseek"
}
```

✅ **Pass Criteria:** Returns error about invalid AI model.

---

## Test 11: Test Voting on Inactive Question

Try to vote on the first question (which is now inactive):

```bash
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/functions/v1/submit_vote' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI' \
  -H 'Content-Type: application/json' \
  -d "{
    \"question_id\": \"$QUESTION_ID\",
    \"ai_model\": \"anthropic\",
    \"voter_session_id\": \"test-session-inactive\"
  }" \
  -s | jq
```

**Expected Output:**
```json
{
  "success": false,
  "message": "Question is no longer active"
}
```

✅ **Pass Criteria:** Returns error about question no longer being active.

---

## Test 12: Test Realtime Subscriptions (Browser Console)

To test Realtime subscriptions, open the browser console and run:

```javascript
// Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://xihfenboeoypghatehhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI'
);

// Subscribe to votes
const votesChannel = supabase
  .channel('votes-test')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'votes' },
    (payload) => {
      console.log('New vote received:', payload.new);
    }
  )
  .subscribe();

console.log('Subscribed to votes. Submit a vote via curl to see it appear here.');
```

Then run a vote via curl in your terminal and watch the browser console.

✅ **Pass Criteria:** New votes appear in browser console immediately after submission.

---

## Summary Checklist

- [ ] Test 1: Get initial state (no active question)
- [ ] Test 2: Create first question
- [ ] Test 3: Verify active question
- [ ] Test 4: Submit 10 votes (3, 3, 2, 1, 1 distribution)
- [ ] Test 5: Verify vote counts
- [ ] Test 6: Test duplicate vote prevention
- [ ] Test 7: Create second question
- [ ] Test 8: Verify first question completed
- [ ] Test 9: Verify leaderboard updated correctly
- [ ] Test 10: Test invalid AI model
- [ ] Test 11: Test voting on inactive question
- [ ] Test 12: Test Realtime subscriptions

---

## Cleanup

If you want to reset the database for fresh testing:

```bash
# Delete all votes
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/rest/v1/rpc/exec_sql' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "DELETE FROM votes"}'

# Delete all questions
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/rest/v1/rpc/exec_sql' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "DELETE FROM questions"}'

# Reset leaderboard
curl -X POST 'https://xihfenboeoypghatehhl.supabase.co/rest/v1/rpc/exec_sql' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "UPDATE ai_leaderboard SET total_wins=0, total_votes=0, questions_answered=0"}'
```

---

## Quick Test Script

Save this as `test_all.sh` for automated testing:

```bash
#!/bin/bash

# Set your service role key here
export SERVICE_ROLE_KEY="your-service-role-key"

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY0MjMsImV4cCI6MjA4NTQ2MjQyM30.pAhg9M7o8Yg-p-lsqsOqL8LrwsjNg1xebYydwGsgOuI"
BASE_URL="https://xihfenboeoypghatehhl.supabase.co/functions/v1"

echo "=== Test 1: Get Initial State ==="
curl -X GET "$BASE_URL/get_current_state" -H "Authorization: Bearer $ANON_KEY" -s | jq
echo ""

echo "=== Test 2: Create First Question ==="
RESPONSE=$(curl -X POST "$BASE_URL/create_new_question" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"question_text": "Test question 1"}' -s)
echo "$RESPONSE" | jq
QUESTION_ID=$(echo "$RESPONSE" | jq -r '.question_id')
echo "Question ID: $QUESTION_ID"
echo ""

echo "=== Test 3: Submit Votes ==="
for i in {1..3}; do
  echo "Vote $i (anthropic)"
  curl -X POST "$BASE_URL/submit_vote" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"question_id\": \"$QUESTION_ID\", \"ai_model\": \"anthropic\", \"voter_session_id\": \"test-$i\"}" \
    -s | jq
done

echo ""
echo "=== Test 4: Verify Vote Counts ==="
curl -X GET "$BASE_URL/get_current_state" -H "Authorization: Bearer $ANON_KEY" -s | jq '.vote_counts'

echo ""
echo "All tests completed!"
```

Run with:
```bash
chmod +x test_all.sh
./test_all.sh
```
