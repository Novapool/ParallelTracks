import os
import requests
import json
import sys

# --- Configuration ---
OPENROUTER_API_KEY = "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"  
ELEVENLABS_API_KEY = "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"
RESPONSE_CACHE_FILE = "response_cache.json"
AUDIO_OUTPUT_DIR = "../paralleltracks-webapp/public/audio"

# Mapping from simple names to OpenRouter model IDs
MODEL_MAPPING = {
    "anthropic": "anthropic/claude-3.5-sonnet",
    "gpt": "openai/gpt-3.5-turbo",
    "gemini": "google/gemini-2.5-pro",
    "grok": "x-ai/grok-3",
    "deepseek": "deepseek/deepseek-chat"
}

# A selection of models to query
MODELS = ["anthropic", "gpt", "gemini", "grok", "deepseek"]

# --- Helper Functions ---

def log_error(message):
    """Logs a message to stderr."""
    print(message, file=sys.stderr)

def get_cached_responses(dilemma_id):
    """Loads cached responses from the JSON file."""
    if not os.path.exists(RESPONSE_CACHE_FILE):
        return {}
    with open(RESPONSE_CACHE_FILE, 'r') as f:
        cache = json.load(f)
    return cache.get(dilemma_id, {})

def cache_response(dilemma_id, model, response_text):
    """Caches a single response in the JSON file."""
    if not os.path.exists(RESPONSE_CACHE_FILE):
        with open(RESPONSE_CACHE_FILE, 'w') as f:
            json.dump({}, f)

    with open(RESPONSE_CACHE_FILE, 'r+') as f:
        cache = json.load(f)
        if dilemma_id not in cache:
            cache[dilemma_id] = {}
        cache[dilemma_id][model] = response_text
        f.seek(0)
        json.dump(cache, f, indent=4)

def get_openrouter_response(simple_model_name, dilemma_text):
    """Queries a single model via OpenRouter using the mapped full ID."""
    full_model_id = MODEL_MAPPING.get(simple_model_name)
    if not full_model_id:
        raise ValueError(f"Unknown model: {simple_model_name}")

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        },
        data=json.dumps({
            "model": full_model_id,
            "messages": [
                {"role": "user", "content": dilemma_text}
            ]
        })
    )
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content']

# --- Main Execution ---

def process_dilemma(dilemma_id, dilemma_text):
    """
    Main function to get AI responses (from cache or OpenRouter).
    """
    log_error(f"Processing dilemma: {dilemma_id}")

    # Get AI responses
    cached_responses = get_cached_responses(dilemma_id)
    all_responses = {}

    for model in MODELS:
        if model in cached_responses:
            log_error(f"Found cached response for {model}")
            all_responses[model] = cached_responses[model]
        else:
            log_error(f"Querying {model} via OpenRouter...")
            try:
                response_text = get_openrouter_response(model, dilemma_text)
                all_responses[model] = response_text
                cache_response(dilemma_id, model, response_text)
                log_error(f"Successfully got and cached response from {model}")
            except requests.exceptions.RequestException as e:
                log_error(f"Error querying {model}: {e}")
                continue # Move to the next model
    
    return all_responses


if __name__ == "__main__":
    # This is an example of how to run the script.
    # You would replace this with your actual dilemma data.
    example_dilemma_id = "trolley_problem_1"
    example_dilemma_text = (
        "A trolley is running out of control down a track. In its path are five people who have been tied to the track by a mad philosopher. "
        "Fortunately, you can flip a switch, which will lead the trolley down a different track. Unfortunately, there is a single person tied to that track. "
        "Should you flip the switch?"
    )

    # Before running, make sure to replace "YOUR_OPENROUTER_API_KEY" with your actual key.
    if OPENROUTER_API_KEY == "YOUR_OPENROUTER_API_KEY":
        log_error("Please replace 'YOUR_OPENROUTER_API_KEY' with your actual OpenRouter API key.")
    else:
        responses = process_dilemma(example_dilemma_id, example_dilemma_text)
        print(json.dumps(responses, indent=4))
