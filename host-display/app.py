from flask import Flask, render_template, request, jsonify, send_from_directory, abort
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import re
import logging
import uuid
import requests
import base64
from elevenlabs import generate, save, set_api_key
from ai_backend import get_ai_responses, MODELS, generate_scenario_image

load_dotenv()

app = Flask(__name__)

# Setup rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate required environment variables
required_vars = {
    "OPENROUTER_API_KEY": OPENROUTER_API_KEY,
    "ELEVENLABS_API_KEY": ELEVENLABS_API_KEY,
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_SERVICE_ROLE_KEY": SUPABASE_SERVICE_ROLE_KEY
}
missing = [k for k, v in required_vars.items() if not v]
if missing:
    raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

set_api_key(ELEVENLABS_API_KEY)

# Create static directories on startup
os.makedirs('static/audio', exist_ok=True)
os.makedirs('static/images', exist_ok=True)

# Model colors (matching voting webapp)
MODEL_COLORS = {
    "anthropic": "#D97757",
    "gpt": "#10A37F",
    "gemini": "#8E75F0",
    "grok": "#1D9BF0",
    "deepseek": "#4A90E2"
}

# Voice assignments per model (using Voice IDs for reliability)
MODEL_VOICES = {
    "anthropic": "pNInz6obpgDQGcFmaJgB",  # Adam - Dominant, Firm
    "gpt": "TX3LPaxmHKxFdv7VOQHJ",       # Liam - Energetic, Social Media Creator
    "gemini": "EXAVITQu4vr4xnSDxMaL",    # Sarah - Mature, Reassuring, Confident
    "grok": "SOYHLrjzK2X1ezoPC6cr",     # Harry - Fierce Warrior
    "deepseek": "nPczCjzI2devNBz1zQrb"  # Brian - Deep, Resonant and Comforting
}

@app.route('/')
def index():
    return render_template('display.html', models=MODELS, colors=MODEL_COLORS)

@app.route('/submit_question', methods=['POST'])
@limiter.limit("5 per hour")
def submit_question():
    """
    Submit new question to Supabase and generate AI responses
    """
    data = request.get_json()
    question_text = data.get('question_text', '').strip()

    # Input validation
    if not question_text:
        return jsonify({"error": "Question text required"}), 400

    if len(question_text) < 10:
        return jsonify({"error": "Question text too short (min 10 characters)"}), 400

    if len(question_text) > 5000:
        return jsonify({"error": "Question text too long (max 5000 characters)"}), 400

    # Step 1: Submit question to Supabase
    try:
        supabase_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create_new_question",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            },
            json={"question_text": question_text},
            timeout=10
        )
        supabase_response.raise_for_status()
        question_data = supabase_response.json()

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to submit question to Supabase: {str(e)}"}), 500

    # Step 2: Get AI responses
    try:
        ai_responses = get_ai_responses(question_text, OPENROUTER_API_KEY)
    except Exception as e:
        return jsonify({"error": f"Failed to get AI responses: {str(e)}"}), 500

    # Step 3: Generate audio for each response
    audio_files = {}
    for model_name, response_text in ai_responses.items():
        try:
            # Get voice ID for this model, fallback to Adam if not found
            voice_id = MODEL_VOICES.get(model_name, "pNInz6obpgDQGcFmaJgB")

            audio = generate(
                text=response_text,
                voice=voice_id,  # Using Voice ID for reliability
                model="eleven_monolingual_v1"
            )

            # Add unique identifier to prevent race conditions
            audio_filename = f"{model_name}_{question_data['question_id']}_{uuid.uuid4().hex[:8]}.mp3"
            audio_path = os.path.join('static', 'audio', audio_filename)

            # Ensure directory exists
            os.makedirs(os.path.dirname(audio_path), exist_ok=True)
            save(audio, audio_path)

            audio_files[model_name] = f"/static/audio/{audio_filename}"

        except Exception as e:
            logger.error(f"Error generating audio for {model_name}: {e}", exc_info=True)
            audio_files[model_name] = None
    
    # Step 4: Generate scenario image
    image_url = None
    image_error = None

    try:
        image_data = generate_scenario_image(question_text, OPENROUTER_API_KEY)
        if image_data:
            image_filename = f"scenario_{question_data['question_id']}_{uuid.uuid4().hex[:8]}.png"
            image_path = os.path.join('static', 'images', image_filename)

            with open(image_path, "wb") as f:
                f.write(base64.b64decode(image_data))

            image_url = f"/static/images/{image_filename}"
        else:
            image_error = "Image generation returned no data"

    except Exception as e:
        logger.error(f"Error generating scenario image: {e}", exc_info=True)
        image_error = str(e)


    return jsonify({
        "question_id": question_data['question_id'],
        "question_text": question_text,
        "responses": ai_responses,
        "audio_files": audio_files,
        "image_url": image_url,
        "image_error": image_error
    })

@app.route('/static/audio/<path:filename>')
def serve_audio(filename):
    # Validate filename to prevent path traversal attacks
    # Only allow alphanumeric, underscore, hyphen, and .mp3 extension
    if not re.match(r'^[a-z0-9_-]+\.mp3$', filename):
        abort(404)
    return send_from_directory('static/audio', filename)

@app.route('/static/images/<path:filename>')
def serve_image(filename):
    # Validate filename to prevent path traversal attacks
    # Allow subdirectories (like logos/) but prevent .. and absolute paths
    if '..' in filename or filename.startswith('/'):
        abort(404)
    # Only allow alphanumeric, underscore, hyphen, forward slash, and .png extension
    if not re.match(r'^[a-zA-Z0-9_/-]+\.png$', filename):
        abort(404)
    return send_from_directory('static/images', filename)


if __name__ == '__main__':
    # Only enable debug mode if explicitly set in environment
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
