# ParallelTracks Host Display

Flask-based host display webapp for running the ParallelTracks game on a large screen.

## Features

- Display trolley problem images with AI model logos
- Show AI responses with colored subtitles matching each model
- Play responses via text-to-speech using ElevenLabs
- Admin form to submit new questions
- Integration with Supabase backend

## Setup

### 1. Install Dependencies

```bash
cd host-display
python3 -m pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file and add your API keys:

```env
OPENROUTER_API_KEY=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
ELEVENLABS_API_KEY=sk_<YOUR_ELEVENLABS_KEY>
SUPABASE_URL=https://xihfenboeoypghatehhl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<FROM_SUPABASE_DASHBOARD>
```

**Get Supabase Service Role Key:**
1. Navigate to: https://supabase.com/dashboard/project/xihfenboeoypghatehhl/settings/api
2. Copy the "service_role" key (NOT the anon key)
3. Add to `.env` file

**Get ElevenLabs API Key:**
1. Sign up at: https://elevenlabs.io/
2. Copy API key from dashboard
3. Add to `.env` file

### 3. Add Assets

**AI Model Logos:**
Place 100x100px PNG logos in `static/images/logos/`:
- `anthropic.png` - Claude logo
- `gpt.png` - ChatGPT logo
- `gemini.png` - Google Gemini logo
- `grok.png` - xAI Grok logo
- `deepseek.png` - DeepSeek logo

**Trolley Problem Image:**
Place image at `static/images/trolley-problem.png` (800px width recommended)

### 4. Run Application

```bash
python3 app.py
```

Access at: http://localhost:5000

## Usage

1. Open browser to `http://localhost:5000`
2. Enter a trolley problem question in the admin form
3. Click "Submit Question"
4. AI responses will load for all 5 models
5. Click "Play" buttons to hear responses with colored subtitles

## Deployment

### Production Server (Gunicorn)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Systemd Service (Auto-start on boot)

Create `/etc/systemd/system/paralleltracks-host.service`:

```ini
[Unit]
Description=ParallelTracks Host Display
After=network.target

[Service]
User=laithassaf
WorkingDirectory=/Users/laithassaf/Documents/Programs/ParallelTracks/host-display
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/local/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable paralleltracks-host
sudo systemctl start paralleltracks-host
```

## Architecture

- `app.py` - Flask application with routes, rate limiting, and security
- `ai_backend.py` - OpenRouter AI integration
- `cleanup_audio.py` - Audio file cleanup utility
- `templates/display.html` - Main display page
- `static/css/style.css` - Pixel art theme styling
- `static/js/display.js` - Frontend interactions
- `static/images/` - Trolley image and AI logos
- `static/audio/` - Generated TTS audio files (auto-created)

## Troubleshooting

### "Failed to submit question to Supabase"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env`
- Check Supabase dashboard for API key

### "Error querying [model]"
- Check `OPENROUTER_API_KEY` is valid
- Verify OpenRouter account has credits

### ElevenLabs TTS fails
- Verify `ELEVENLABS_API_KEY` is valid
- Check ElevenLabs account has character quota

### Audio doesn't play
- Check browser console for errors
- Verify audio files exist in `static/audio/`
- Test audio file URL directly in browser

### Images not displaying
- Verify image files exist in `static/images/`
- Check file permissions (must be readable)
- Verify filenames match exactly (case-sensitive)

## Security Features

The application includes several security measures:

- **Environment Variable Validation**: Required API keys are validated on startup
- **Path Traversal Protection**: Audio file serving validates filenames
- **Rate Limiting**: 5 questions per hour per IP to prevent API quota abuse
- **Input Validation**: Question text length limits (10-5000 characters)
- **Debug Mode Protection**: Debug mode disabled by default (set `FLASK_DEBUG=true` only for development)
- **Logging**: All errors logged for debugging and security monitoring

### Audio File Cleanup

Audio files accumulate over time. Set up automatic cleanup:

**Option 1: Cron Job**
```bash
# Add to crontab (runs every 6 hours, deletes files older than 24 hours)
crontab -e

# Add this line:
0 */6 * * * cd /Users/laithassaf/Documents/Programs/ParallelTracks/host-display && python3 cleanup_audio.py --hours 24
```

**Option 2: Manual Cleanup**
```bash
cd host-display
python3 cleanup_audio.py --hours 24
```

### Production Checklist

Before deploying to production:

1. ✅ Set all API keys in `.env`
2. ✅ Ensure `FLASK_DEBUG` is NOT set (or set to `false`)
3. ✅ Setup audio cleanup cron job
4. ✅ Use HTTPS (configure reverse proxy like nginx)
5. ✅ Keep `.env` file secured (chmod 600)
6. ✅ Monitor API usage and costs

## License

MIT
