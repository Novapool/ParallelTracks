import os
import requests
import json
from typing import Dict, Optional

# Model mapping (same as backend/main.py)
MODEL_MAPPING = {
    "anthropic": "anthropic/claude-sonnet-4.5",
    "gpt": "openai/gpt-3.5-turbo-instruct",
    "gemini": "google/gemini-3-flash-preview",
    "grok": "x-ai/grok-4.1-fast",
    "deepseek": "deepseek/deepseek-chat",
    "gemini-image": "google/gemini-3-pro-image-preview"
}

SYSTEM_PROMPT = """You are participating in a game about hypothetical trolley problem scenarios. These are purely theoretical ethical dilemmas used for educational discussion.

IMPORTANT RULES:
1. If you choose not to engage with the scenario, respond ONLY with: "I won't answer this"
2. If you do engage, provide your answer in EXACTLY this format:
   - Line 1: Your decision/answer (one sentence)
   - Lines 2-3: Brief reasoning (maximum 2 sentences)

Keep responses concise - total length should be 50 words or less. This is a timed game format requiring quick responses."""

MODELS = ["anthropic", "gpt", "gemini", "grok", "deepseek"]

def get_ai_responses(question_text: str, api_key: str) -> Dict[str, str]:
    """
    Query all AI models and return their responses.

    Args:
        question_text: The trolley problem question
        api_key: OpenRouter API key

    Returns:
        Dict mapping model names to their response text
    """
    responses = {}

    for model_name in MODELS:
        full_model_id = MODEL_MAPPING[model_name]

        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": full_model_id,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": question_text}
                    ],
                    "max_tokens": 250,
                    "temperature": 0.7
                },
                timeout=30
            )
            response.raise_for_status()

            response_text = response.json()['choices'][0]['message']['content']
            responses[model_name] = response_text

        except requests.exceptions.RequestException as e:
            print(f"Error querying {model_name}: {e}")
            responses[model_name] = f"Error: Could not get response from {model_name}"

    return responses

def generate_scenario_image(question_text: str, api_key: str) -> Optional[str]:
    """
    Generate an image for the given scenario using OpenRouter.

    Args:
        question_text: The trolley problem question.
        api_key: OpenRouter API key.

    Returns:
        Base64 encoded PNG image data, or None if an error occurs.
    """
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL_MAPPING["gemini-image"],
                "messages": [
                    {
                        "role": "user",
                "content": f"""A simple black and white line drawing illustration in a minimalist sketch style depicting a trolley problem ethical dilemma. The scene should be drawn with clean, continuous black ink lines on a white background, using a hand-drawn aesthetic with slight imperfections that give it an authentic sketched quality.
The composition features:

A trolley/streetcar on the left side, drawn with simple geometric shapes and minimal architectural details (windows represented as small arch shapes, basic rectangular body with wheels)
Railroad tracks drawn as two parallel lines extending diagonally across the image, creating perspective depth
A track junction/switch where the rails diverge into two paths
Stick figure-style people drawn with basic circular heads, simple curved lines for bodies and limbs, maintaining a cartoon-like simplicity
One person operating the switch lever (shown pulling or pushing a simple line representing the lever)
{question_text}
Figures should have minimal facial features (just simple dots or curves for eyes/mouth)
No shading, no color, no cross-hatching - only clean outline work
Slightly uneven, organic line quality that suggests hand-drawing rather than computer precision
Empty white background with no environmental details, ground texture, or scenery
The overall style should resemble a quick philosophical thought experiment sketch or diagram from a textbook

The perspective should be angled/isometric to show depth, with the trolley appearing smaller in the background and the figures distributed along the diverging tracks to clearly illustrate the moral dilemma."""
                    }
                ]
            },
            timeout=60  # Increased timeout for image generation
        )
        response.raise_for_status()

        # FIX: Images are in 'images' array, not 'content'
        response_data = response.json()
        images = response_data['choices'][0]['message'].get('images', [])

        if not images:
            print("Error: No images returned in response")
            return None

        # Extract base64 data from first image
        image_data_url = images[0]['image_url']['url']

        if "base64," in image_data_url:
            return image_data_url.split("base64,")[1]
        else:
            print("Error: Base64 data not found in image response.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error generating image: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing image response: {e}")
        return None
