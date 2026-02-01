#!/usr/bin/env python3
"""
Cleanup script for old audio files.
Run this periodically via cron to prevent disk space exhaustion.

Usage:
    python3 cleanup_audio.py --hours 24

Or add to crontab:
    0 */6 * * * cd /path/to/host-display && python3 cleanup_audio.py --hours 24
"""
import os
import time
import argparse
from pathlib import Path


def cleanup_old_audio_files(audio_dir='static/audio', max_age_hours=24):
    """
    Delete audio files older than max_age_hours.

    Args:
        audio_dir: Directory containing audio files
        max_age_hours: Maximum age in hours before deletion
    """
    if not os.path.exists(audio_dir):
        print(f"Audio directory {audio_dir} does not exist")
        return

    max_age_seconds = max_age_hours * 3600
    current_time = time.time()
    deleted_count = 0
    deleted_size = 0

    for filename in os.listdir(audio_dir):
        if not filename.endswith('.mp3'):
            continue

        filepath = os.path.join(audio_dir, filename)

        try:
            file_age = current_time - os.path.getmtime(filepath)

            if file_age > max_age_seconds:
                file_size = os.path.getsize(filepath)
                os.remove(filepath)
                deleted_count += 1
                deleted_size += file_size
                print(f"Deleted: {filename} (age: {file_age/3600:.1f}h)")

        except Exception as e:
            print(f"Error deleting {filename}: {e}")

    deleted_mb = deleted_size / (1024 * 1024)
    print(f"\nCleanup complete:")
    print(f"  Files deleted: {deleted_count}")
    print(f"  Space freed: {deleted_mb:.2f} MB")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Cleanup old audio files')
    parser.add_argument('--hours', type=int, default=24,
                        help='Delete files older than this many hours (default: 24)')
    parser.add_argument('--dir', type=str, default='static/audio',
                        help='Audio directory path (default: static/audio)')

    args = parser.parse_args()

    cleanup_old_audio_files(args.dir, args.hours)
