// Form submission
document.getElementById('question-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const questionText = document.getElementById('new-question').value;
    const statusMessage = document.getElementById('status-message');
    const submitBtn = e.target.querySelector('.submit-btn');

    // Update UI
    statusMessage.textContent = 'Submitting question...';
    statusMessage.className = 'status-message';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/submit_question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question_text: questionText })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit question');
        }

        // Update question display
        document.getElementById('question-text').textContent = data.question_text;

        // Update each model's response
        Object.entries(data.responses).forEach(([model, responseText]) => {
            const responseEl = document.getElementById(`response-${model}`);
            responseEl.textContent = responseText;
            responseEl.classList.remove('loading');

            // Setup audio if available
            if (data.audio_files[model]) {
                const audioEl = document.getElementById(`audio-${model}`);
                const audioSrc = document.getElementById(`audio-src-${model}`);
                const playBtn = document.getElementById(`play-${model}`);

                audioSrc.src = data.audio_files[model];
                audioEl.load();
                playBtn.style.display = 'block';

                // Setup play button
                playBtn.onclick = () => playAudio(model);
            }
        });

        // Success
        statusMessage.textContent = 'Question submitted successfully!';
        statusMessage.className = 'status-message success';
        document.getElementById('new-question').value = '';

    } catch (error) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = 'status-message error';
    } finally {
        submitBtn.disabled = false;
    }
});

// Audio playback with subtitle display
function playAudio(model) {
    const audioEl = document.getElementById(`audio-${model}`);
    const subtitleEl = document.getElementById(`subtitle-${model}`);
    const subtitleText = subtitleEl.querySelector('.subtitle-text');
    const responseText = document.getElementById(`response-${model}`).textContent;

    // Show subtitle with full text
    subtitleText.textContent = responseText;
    subtitleEl.style.display = 'block';

    // Play audio
    audioEl.play();

    // Hide subtitle when audio ends
    audioEl.onended = () => {
        subtitleEl.style.display = 'none';
    };
}

// Stop all audio when one starts playing
document.querySelectorAll('audio').forEach(audio => {
    audio.addEventListener('play', function() {
        document.querySelectorAll('audio').forEach(otherAudio => {
            if (otherAudio !== this) {
                otherAudio.pause();
                otherAudio.currentTime = 0;
            }
        });

        // Hide all other subtitles
        document.querySelectorAll('.subtitle-overlay').forEach(subtitle => {
            if (subtitle.id !== `subtitle-${this.id.replace('audio-', '')}`) {
                subtitle.style.display = 'none';
            }
        });
    });
});
