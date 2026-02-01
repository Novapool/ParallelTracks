import os
import requests
import json
from typing import Dict, Optional

# Model mapping (same as backend/main.py)
MODEL_MAPPING = {
    "anthropic": "anthropic/claude-3.5-sonnet",
    "gpt": "openai/gpt-3.5-turbo",
    "gemini": "google/gemini-2.5-pro",
    "grok": "x-ai/grok-3",
    "deepseek": "deepseek/deepseek-chat",
    "gemini-image": "google/gemini-3-pro-image-preview"
}

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
                        {"role": "user", "content": question_text}
                    ]
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
                        "content": f"A cartoon illustration of the trolley problem. The scenario is: {question_text}"
                    }
                ]
            },
            timeout=60  # Increased timeout for image generation
        )
        response.raise_for_status()
        # The image is in the 'content' of the first choice's message, assuming it's a data URL
        image_data_url = response.json()['choices'][0]['message']['content']
        # The data URL is in the format "data:image/png;base64,iVBORw0KGgo..."
        # We need to extract the base64 part.
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
