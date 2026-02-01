// Question template constant
const QUESTION_TEMPLATE = 'You must choose between two bad outcomes: allowing a runaway trolley to {BLANK_1} or pulling a lever to divert it to a side track where it will {BLANK_2}.';

// Audio auto-play configuration
const PLAYBACK_ORDER = ['anthropic', 'gpt', 'gemini', 'grok', 'deepseek'];
const AUTO_PLAY_DELAY = 1500; // ms
let autoPlayEnabled = false;
const audioLoadState = {
    anthropic: false,
    gpt: false,
    gemini: false,
    grok: false,
    deepseek: false
};

// Character counter update function
function updateCharCounter(textareaId, counterId) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    const charCount = textarea.value.length;

    counter.textContent = charCount;

    const counterContainer = counter.parentElement;
    counterContainer.classList.remove('warning', 'error');

    if (charCount > 500) {
        counterContainer.classList.add('error');
    } else if (charCount > 450) {
        counterContainer.classList.add('warning');
    }
}

// Live preview update function
function updatePreview() {
    const outcome1 = document.getElementById('outcome1').value.trim();
    const outcome2 = document.getElementById('outcome2').value.trim();
    const previewText = document.getElementById('preview-text');

    const preview1 = outcome1 || '<span class="preview-blank">[...]</span>';
    const preview2 = outcome2 || '<span class="preview-blank">[...]</span>';

    previewText.innerHTML = `You must choose between two bad outcomes: allowing a runaway trolley to ${preview1} or pulling a lever to divert it to a side track where it will ${preview2}.`;
}

// Setup event listeners for textareas
document.getElementById('outcome1').addEventListener('input', () => {
    updateCharCounter('outcome1', 'counter1');
    updatePreview();
});

document.getElementById('outcome2').addEventListener('input', () => {
    updateCharCounter('outcome2', 'counter2');
    updatePreview();
});

// Form submission
document.getElementById('question-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const outcome1 = document.getElementById('outcome1').value.trim();
    const outcome2 = document.getElementById('outcome2').value.trim();
    const statusMessage = document.getElementById('status-message');
    const submitBtn = e.target.querySelector('.submit-btn');

    // Client-side validation
    if (outcome1.length < 3 || outcome1.length > 500) {
        statusMessage.textContent = 'Error: Outcome 1 must be 3-500 characters';
        statusMessage.className = 'status-message error';
        return;
    }

    if (outcome2.length < 3 || outcome2.length > 500) {
        statusMessage.textContent = 'Error: Outcome 2 must be 3-500 characters';
        statusMessage.className = 'status-message error';
        return;
    }

    // Assemble question from template
    const questionText = QUESTION_TEMPLATE
        .replace('{BLANK_1}', outcome1)
        .replace('{BLANK_2}', outcome2);

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

        // Reset audio state
        autoPlayEnabled = false;
        Object.keys(audioLoadState).forEach(key => {
            audioLoadState[key] = false;
        });

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

                // Track audio load state
                audioEl.addEventListener('canplaythrough', () => {
                    audioLoadState[model] = true;
                    checkAndStartAutoPlay();
                }, { once: true });

                playBtn.style.display = 'block';

                // Setup play button
                playBtn.onclick = () => playAudio(model, false);
            }
        });

        // Update scenario image if available
        if (data.image_url) {
            const scenarioImage = document.getElementById('scenario-image');
            scenarioImage.src = data.image_url;
        }

        // Success - reset form
        statusMessage.textContent = 'Question submitted successfully!';
        statusMessage.className = 'status-message success';
        document.getElementById('outcome1').value = '';
        document.getElementById('outcome2').value = '';
        updateCharCounter('outcome1', 'counter1');
        updateCharCounter('outcome2', 'counter2');
        updatePreview();

    } catch (error) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = 'status-message error';
    } finally {
        submitBtn.disabled = false;
    }
});

function checkAndStartAutoPlay() {
    const allLoaded = PLAYBACK_ORDER.every(model => audioLoadState[model]);

    if (allLoaded && !autoPlayEnabled) {
        autoPlayEnabled = true;
        console.log('All audio loaded. Starting auto-play in', AUTO_PLAY_DELAY, 'ms');

        setTimeout(() => {
            if (autoPlayEnabled) {
                playAudioSequence(0);
            }
        }, AUTO_PLAY_DELAY);
    }
}

function playAudioSequence(index) {
    if (!autoPlayEnabled || index >= PLAYBACK_ORDER.length) {
        return;
    }

    const model = PLAYBACK_ORDER[index];
    const audioEl = document.getElementById(`audio-${model}`);

    if (!audioEl || !audioEl.src) {
        playAudioSequence(index + 1);
        return;
    }

    // Use existing playAudio for subtitle handling
    playAudio(model, true);

    // Chain to next audio when this ends
    const originalOnended = audioEl.onended;
    audioEl.onended = () => {
        if (originalOnended) originalOnended();

        if (autoPlayEnabled) {
            setTimeout(() => {
                playAudioSequence(index + 1);
            }, 500);
        }
    };
}

// Audio playback with subtitle display
function playAudio(model, isAutoPlay = false) {
    // Disable auto-sequence if manual play
    if (!isAutoPlay) {
        autoPlayEnabled = false;
    }

    const audioEl = document.getElementById(`audio-${model}`);
    const subtitleEl = document.getElementById(`subtitle-${model}`);
    const subtitleText = subtitleEl.querySelector('.subtitle-text');
    const responseText = document.getElementById(`response-${model}`).textContent;

    // Show subtitle with full text
    subtitleText.textContent = responseText;
    subtitleEl.style.display = 'block';

    // Play audio
    audioEl.play();

    // For manual play, set simple onended
    if (!isAutoPlay) {
        audioEl.onended = () => {
            subtitleEl.style.display = 'none';
        };
    }
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
