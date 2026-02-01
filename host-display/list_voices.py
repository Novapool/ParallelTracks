#!/usr/bin/env python3
"""
Helper script to list available ElevenLabs voices
"""
from dotenv import load_dotenv
import os
from elevenlabs import voices, set_api_key

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    print("Error: ELEVENLABS_API_KEY not found in .env")
    exit(1)

set_api_key(ELEVENLABS_API_KEY)

print("\nAvailable ElevenLabs Voices:")
print("-" * 50)

try:
    voice_list = voices()
    for voice in voice_list:
        print(f"Name: {voice.name}")
        print(f"  Voice ID: {voice.voice_id}")
        print(f"  Category: {voice.category}")
        print()
except Exception as e:
    print(f"Error fetching voices: {e}")
    print("\nTrying alternative method...")

    # Fallback: Use common premade voices
    print("\nCommon ElevenLabs Premade Voices:")
    print("- Rachel")
    print("- Domi")
    print("- Bella")
    print("- Antoni")
    print("- Elli")
    print("- Josh")
    print("- Arnold")
    print("- Callum")
    print("- Charlotte")
    print("- Clyde")
    print("- Dave")
    print("- Fin")
    print("- Freya")
    print("- George")
    print("- Gigi")
    print("- Glinda")
    print("- Grace")
    print("- Harry")
    print("- James")
    print("- Jeremy")
    print("- Jessie")
    print("- Liam")
    print("- Matilda")
    print("- Michael")
    print("- Patrick")
    print("- Sarah")
