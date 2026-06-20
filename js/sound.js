// ============================================================
// sound.js – Audio context and sound effects
// ============================================================

let backgroundAudio = null;

function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

function initBackgroundMusic() {
    if (!backgroundAudio) {
        backgroundAudio = document.getElementById('background-music');
        if (!backgroundAudio) {
            backgroundAudio = document.createElement('audio');
            backgroundAudio.id = 'background-music';
            backgroundAudio.src = 'theme.m4a';
            backgroundAudio.loop = true;
            backgroundAudio.volume = musicVolume;
            document.body.appendChild(backgroundAudio);
        } else {
            backgroundAudio.volume = musicVolume;
        }
    }
    playBackgroundMusic();
}

function playBackgroundMusic() {
    if (backgroundAudio && bgmEnabled) {
        backgroundAudio.play().catch(() => {});
    }
}

function stopBackgroundMusic() {
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
    }
}

function toggleBackgroundMusic() {
    bgmEnabled = !bgmEnabled;
    if (bgmEnabled) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
}

function playSfx(type) {
    if (!sfxEnabled) return;
    if (!audioContext) initAudio();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.value = 0.15 * sfxVolume;
    const osc = audioContext.createOscillator();
    osc.connect(gain);
    
    switch(type) {
        case 'click':
            osc.frequency.value = 880;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
        case 'hover':
            osc.frequency.value = 523.25;
            gain.gain.value = 0.08 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.06);
            break;
        case 'roll':
            osc.frequency.value = 659.25;
            gain.gain.value = 0.2 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
        case 'diceTick':
            osc.frequency.value = 1200 + Math.random() * 800;
            gain.gain.value = 0.06 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.type = 'square';
            osc.start(now);
            osc.stop(now + 0.03);
            break;
        case 'diceLand':
            osc.frequency.value = 400;
            gain.gain.value = 0.12 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.type = 'triangle';
            osc.start(now);
            osc.stop(now + 0.06);
            break;
        case 'move':
            osc.frequency.value = 440;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
        case 'correct':
            osc.frequency.value = 1046.5;
            gain.gain.value = 0.2 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.35);
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1318.52;
            gain2.gain.value = 0.1 * sfxVolume;
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            osc2.start(now + 0.05);
            osc2.stop(now + 0.4);
            break;
        case 'wrong':
            osc.frequency.value = 261.63;
            gain.gain.value = 0.15 * sfxVolume;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.25);
            break;
        case 'modalOpen':
            osc.frequency.value = 740;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
        case 'modalClose':
            osc.frequency.value = 493.88;
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.09);
            break;
        default:
            osc.disconnect();
            gain.disconnect();
            return;
    }
}

function attachHoverSounds() {
    const interactive = document.querySelectorAll('button, .cell-hit, .player-card, .quiz-opt-btn, #roll-btn, #start-btn, .nav-btn');
    interactive.forEach(el => {
        el.removeEventListener('mouseenter', hoverHandler);
        el.addEventListener('mouseenter', hoverHandler);
    });
}

function hoverHandler() {
    playSfx('hover');
}

function enableAudioOnFirstClick() {
    const handler = () => {
        initAudio();
        playBackgroundMusic();
        playSfx('click');
        document.removeEventListener('click', handler);
        document.removeEventListener('touchstart', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler);
}