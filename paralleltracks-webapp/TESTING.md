# Testing Guide

## Local Testing

### Setup
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Manual Test Checklist

### Initial Load
- [ ] Page loads without errors
- [ ] Session ID is generated and stored in localStorage
- [ ] Current state is fetched from Supabase
- [ ] If active question exists, it displays correctly
- [ ] If no active question, shows "Waiting for next question..."

### Voting Flow
- [ ] All 5 AI model buttons display with correct labels
- [ ] Button colors match AI model theme colors
- [ ] Buttons are touch-friendly (minimum 48px height)
- [ ] Click a button to vote
- [ ] Loading state shows during submission
- [ ] Success message displays after vote
- [ ] Buttons are disabled after successful vote
- [ ] Question ID is saved to localStorage

### Duplicate Vote Prevention
- [ ] After voting, try to vote again
- [ ] Should see error: "You have already voted on this question"
- [ ] Buttons remain disabled
- [ ] Reload page - buttons still disabled for same question

### Real-time Updates
- [ ] Open webapp in two browser windows (or incognito)
- [ ] Vote in window 1
- [ ] Verify window 2 sees vote count update immediately
- [ ] Vote counts increment correctly
- [ ] Progress bars update smoothly

### Vote Results Display
- [ ] Before any votes: "No votes yet" message
- [ ] After votes: Shows vote counts for each AI
- [ ] Progress bars display correctly
- [ ] Percentages calculated correctly
- [ ] Total vote count displayed
- [ ] Results update in real-time

### Leaderboard Page
- [ ] Navigate to /leaderboard
- [ ] Leaderboard data loads
- [ ] AI models sorted by wins (descending)
- [ ] Displays: wins, total votes, questions answered
- [ ] AI model labels display (not raw strings)
- [ ] "Back to Voting" link works

### Error Handling
- [ ] Test with invalid question ID
- [ ] Test with network disconnected
- [ ] Test with Supabase unreachable
- [ ] Error messages display clearly
- [ ] App recovers gracefully

### Mobile Responsiveness
Test on mobile device or Chrome DevTools device mode:
- [ ] Text is readable (no tiny fonts)
- [ ] Buttons are easy to tap (no misclicks)
- [ ] Layout doesn't break on small screens
- [ ] Horizontal scrolling not required
- [ ] Images/content scale properly

### Browser Compatibility
Test on:
- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Automated Testing

### Build Test
```bash
npm run build
```
Should complete without errors or warnings.

### Type Checking
```bash
npx tsc --noEmit
```
Should complete without type errors.

### Lint Check
```bash
npm run lint
```
Should pass without errors.

## Integration Testing with Backend

### Prerequisites
Ensure Supabase backend is running and has:
- At least one active question
- Edge functions deployed
- Realtime enabled

### Test Scenarios

#### Scenario 1: New User Voting
1. Clear localStorage
2. Load app
3. Verify session ID created
4. Vote on active question
5. Verify vote saved to database
6. Check real-time updates work

#### Scenario 2: Returning User
1. Vote on question
2. Close browser
3. Reopen browser
4. Verify session ID persists
5. Verify can't vote again on same question

#### Scenario 3: New Question
1. Vote on current question
2. Admin posts new question
3. Verify app detects new question
4. Verify voting buttons re-enabled
5. Verify can vote on new question

#### Scenario 4: Concurrent Voting
1. Open 5 browser windows
2. Vote from each window (different AI)
3. Verify all votes counted
4. Verify real-time updates in all windows
5. Check vote counts accurate

## Performance Testing

### Metrics to Check
- [ ] First Load JS < 200 kB
- [ ] Time to Interactive < 3 seconds
- [ ] Real-time latency < 500ms

### Tools
- Chrome DevTools Lighthouse
- Chrome DevTools Performance tab
- Network tab (check request sizes)

## Database Verification

After voting, check Supabase:

```sql
-- Verify vote was saved
SELECT * FROM votes
WHERE voter_session_id = '<your-session-id>'
ORDER BY created_at DESC
LIMIT 10;

-- Check vote counts
SELECT ai_model, COUNT(*) as count
FROM votes
WHERE question_id = '<question-id>'
GROUP BY ai_model;

-- Verify leaderboard
SELECT * FROM ai_leaderboard
ORDER BY total_wins DESC;
```

## Debugging Tips

### Check Browser Console
Look for:
- Network errors (fetch failures)
- JavaScript errors
- Supabase connection issues
- Real-time subscription errors

### Check Network Tab
Verify:
- API calls succeed (200 status)
- Edge functions respond correctly
- Real-time WebSocket connected

### Check localStorage
```javascript
// In browser console
localStorage.getItem('voter_session_id')
localStorage.getItem('voted_questions')
```

### Check Supabase Logs
- Go to Supabase dashboard
- Check Edge Function logs
- Check Database logs
- Check Realtime logs

## Known Issues

None currently.

## Reporting Bugs

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and OS
5. Screenshots/videos
6. Console errors
