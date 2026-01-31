# Set your service role key here
export SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaGZlbmJvZW95cGdoYXRlaGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg4NjQyMywiZXhwIjoyMDg1NDYyNDIzfQ.tIGB3jmqyFFSWut8doeR3M01tlPUDUqUOT6zZ8ArC0o"

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