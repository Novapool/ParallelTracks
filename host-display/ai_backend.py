import os
import requests
import json
from typing import Dict

# Model mapping (same as backend/main.py)
MODEL_MAPPING = {
    "anthropic": "anthropic/claude-3.5-sonnet",
    "gpt": "openai/gpt-3.5-turbo",
    "gemini": "google/gemini-2.5-pro",
    "grok": "x-ai/grok-3",
    "deepseek": "deepseek/deepseek-chat"
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
