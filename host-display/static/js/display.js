// Question template constant
const QUESTION_TEMPLATE = 'You must choose between two bad outcomes: allowing a runaway trolley to {BLANK_1} or pulling a lever to divert it to a side track where it will {BLANK_2}.';

// Audio auto-play configuration
const PLAYBACK_ORDER = ['anthropic', 'gpt', 'gemini', 'grok', 'deepseek'];
const AUTO_PLAY_DELAY = 1500; // ms
let autoPlayEnabled = false;
let audioUnlocked = false;        // Track if user unlocked audio
let pendingAutoPlay = false;      // Track if waiting for unlock
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
        pendingAutoPlay = false;
        // Reset audioUnlocked to force user to click unlock button each time
        audioUnlocked = false;
        Object.keys(audioLoadState).forEach(key => {
            audioLoadState[key] = false;
        });

        // Hide unlock panel initially - it will show when audio is ready
        document.getElementById('audio-unlock-panel').style.display = 'none';
        console.log('Question submitted - waiting for audio to load');

        // Update each model's response
        Object.entries(data.responses).forEach(([model, responseText]) => {
            const responseEl = document.getElementById(`response-${model}`);
            responseEl.textContent = responseText;
            responseEl.classList.remove('loading');

            // Setup audio if available
            if (data.audio_files[model]) {
                const audioEl = document.getElementById(`audio-${model}`);
                const playBtn = document.getElementById(`play-${model}`);

                // Set src directly on audio element (simpler than using <source> child)
                audioEl.src = data.audio_files[model];
                audioEl.load();

                console.log(`Setting audio src for ${model}:`, data.audio_files[model]);

                // Track audio load state
                audioEl.addEventListener('canplaythrough', () => {
                    console.log(`Audio loaded for ${model}`);
                    audioLoadState[model] = true;
                    checkAndStartAutoPlay();
                }, { once: true });

                // Also try loadeddata as a fallback
                audioEl.addEventListener('loadeddata', () => {
                    if (!audioLoadState[model]) {
                        console.log(`Audio data loaded for ${model} (fallback event)`);
                        audioLoadState[model] = true;
                        checkAndStartAutoPlay();
                    }
                }, { once: true });

                playBtn.style.display = 'block';

                // Setup play button
                playBtn.onclick = () => playAudio(model, false);
            }
        });

        // Update scenario image if available
        const scenarioImage = document.getElementById('scenario-image');

        if (data.image_url) {
            scenarioImage.src = data.image_url;
            scenarioImage.alt = 'Generated scenario illustration';
        } else if (data.image_error) {
            console.warn('Image generation failed:', data.image_error);
            // Keep default trolley image - optionally notify admin
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

    console.log('checkAndStartAutoPlay called:', {
        allLoaded,
        audioLoadState,
        audioUnlocked,
        autoPlayEnabled,
        pendingAutoPlay
    });

    if (!allLoaded) {
        console.log('Not all audio files loaded yet');
        return;
    }

    if (autoPlayEnabled) {
        console.log('Auto-play already enabled');
        return;
    }

    // Show unlock panel if audio not yet unlocked
    if (!audioUnlocked) {
        pendingAutoPlay = true;
        document.getElementById('audio-unlock-panel').style.display = 'block';
        console.log('Auto-play blocked - user interaction required');
        return;
    }

    autoPlayEnabled = true;
    pendingAutoPlay = false;
    console.log('Starting auto-play in', AUTO_PLAY_DELAY, 'ms');

    setTimeout(() => {
        if (autoPlayEnabled) {
            console.log('Starting audio playback sequence');
            playAudioSequence(0);
        }
    }, AUTO_PLAY_DELAY);
}

async function playAudioSequence(index) {
    if (!autoPlayEnabled || index >= PLAYBACK_ORDER.length) {
        console.log('Auto-play sequence complete or disabled');
        return;
    }

    const model = PLAYBACK_ORDER[index];
    const audioEl = document.getElementById(`audio-${model}`);

    console.log(`Playing ${model} (${index + 1}/${PLAYBACK_ORDER.length})`);

    if (!audioEl || !audioEl.src) {
        console.warn(`Skipping ${model} - no audio element or src`);
        playAudioSequence(index + 1);
        return;
    }

    try {
        // Set up the chain BEFORE playing (important!)
        const handleEnded = () => {
            console.log(`${model} finished playing`);
            if (autoPlayEnabled && index + 1 < PLAYBACK_ORDER.length) {
                setTimeout(() => {
                    playAudioSequence(index + 1);
                }, 500);
            }
        };

        // Play the audio with subtitle
        const subtitleEl = document.getElementById(`subtitle-${model}`);
        const subtitleText = subtitleEl.querySelector('.subtitle-text');
        const responseText = document.getElementById(`response-${model}`).textContent;

        // Show subtitle
        subtitleText.textContent = responseText;
        subtitleEl.style.display = 'block';

        // Set up ended handler
        audioEl.onended = () => {
            subtitleEl.style.display = 'none';
            handleEnded();
        };

        // Play
        await audioEl.play();
        console.log(`${model} started playing`);

    } catch (error) {
        console.error(`Auto-play failed for ${model}:`, error);

        // Hide subtitle on error
        const subtitleEl = document.getElementById(`subtitle-${model}`);
        if (subtitleEl) subtitleEl.style.display = 'none';

        // If blocked by browser, show unlock panel again
        if (error.name === 'NotAllowedError') {
            audioUnlocked = false;
            pendingAutoPlay = true;
            document.getElementById('audio-unlock-panel').style.display = 'block';
            autoPlayEnabled = false;
        } else {
            // Skip to next on other errors
            playAudioSequence(index + 1);
        }
    }
}

// Audio playback with subtitle display
function playAudio(model, isAutoPlay = false) {
    return new Promise((resolve, reject) => {
        if (!isAutoPlay) {
            autoPlayEnabled = false;
        }

        const audioEl = document.getElementById(`audio-${model}`);
        const subtitleEl = document.getElementById(`subtitle-${model}`);
        const subtitleText = subtitleEl.querySelector('.subtitle-text');
        const responseText = document.getElementById(`response-${model}`).textContent;

        // Show subtitle
        subtitleText.textContent = responseText;
        subtitleEl.style.display = 'block';

        // Setup handlers
        const handleEnded = () => {
            subtitleEl.style.display = 'none';
            resolve();
        };

        const handleError = (error) => {
            subtitleEl.style.display = 'none';
            reject(error);
        };

        audioEl.onended = handleEnded;

        // Play and handle promise rejection
        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.catch(handleError);
        }
    });
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

// Setup audio unlock button
document.addEventListener('DOMContentLoaded', () => {
    const unlockBtn = document.getElementById('audio-unlock-btn');
    const unlockPanel = document.getElementById('audio-unlock-panel');

    unlockBtn.addEventListener('click', async () => {
        console.log('Audio unlock button clicked');

        // Unlock all audio elements by playing/pausing them
        const unlockPromises = PLAYBACK_ORDER.map(async (model) => {
            const audioEl = document.getElementById(`audio-${model}`);
            const hasSrc = audioEl?.src && audioEl.src !== '' && !audioEl.src.endsWith('/');

            console.log(`Unlocking ${model}:`, {
                hasElement: !!audioEl,
                hasSrc: hasSrc,
                src: audioEl?.src,
                readyState: audioEl?.readyState
            });

            if (audioEl && hasSrc) {
                try {
                    await audioEl.play();
                    audioEl.pause();
                    audioEl.currentTime = 0;
                    console.log(`Successfully unlocked ${model}`);
                    return true;
                } catch (e) {
                    console.warn(`Failed to unlock ${model}:`, e);
                    return false;
                }
            } else {
                console.warn(`Cannot unlock ${model} - audio not ready yet`);
                return false;
            }
        });

        const results = await Promise.all(unlockPromises);
        console.log('Unlock results:', results);

        audioUnlocked = true;
        unlockPanel.style.display = 'none';

        // Start auto-play if it was pending
        if (pendingAutoPlay && !autoPlayEnabled) {
            console.log('Starting auto-play after unlock');
            checkAndStartAutoPlay();
        }
    });
});
