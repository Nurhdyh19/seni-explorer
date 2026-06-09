// ============================================================
// state.js – Global game state (mutable)
// ============================================================

let spaceSequence = [];
let spacePositions = [];
let spacesData = {};
let players = [];
let currentPlayer = 0;
let rolled = false;
let isMoving = false;
let targetLaps = DEFAULT_TARGET_LAPS;
let gameActive = true;
let movementCancelled = false;

// Sound & localization globals
let audioContext = null;
let sfxEnabled = true;
let bgmEnabled = true;
let musicVolume = 0.15; // Default: 15% (lower than sfx)
let sfxVolume = 0.25;   // Default: 25% (higher than music)
let uiText = {};
let localizationLoaded = false;

// Load settings from localStorage
function loadVolumeSettings() {
    const savedMusicVolume = localStorage.getItem('seniExplorer_musicVolume');
    const savedSfxVolume = localStorage.getItem('seniExplorer_sfxVolume');
    const savedSfxEnabled = localStorage.getItem('seniExplorer_sfxEnabled');
    const savedBgmEnabled = localStorage.getItem('seniExplorer_bgmEnabled');
    
    if (savedMusicVolume !== null) {
        musicVolume = parseFloat(savedMusicVolume);
    }
    if (savedSfxVolume !== null) {
        sfxVolume = parseFloat(savedSfxVolume);
    }
    if (savedSfxEnabled !== null) {
        sfxEnabled = savedSfxEnabled === 'true';
    }
    if (savedBgmEnabled !== null) {
        bgmEnabled = savedBgmEnabled === 'true';
    }
}

// Save settings to localStorage
function saveMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('seniExplorer_musicVolume', musicVolume);
    // Update background music if it exists
    if (backgroundAudio) {
        backgroundAudio.volume = musicVolume;
    }
}

function saveSfxVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('seniExplorer_sfxVolume', sfxVolume);
}

function saveSfxEnabled(enabled) {
    sfxEnabled = enabled;
    localStorage.setItem('seniExplorer_sfxEnabled', sfxEnabled);
}

function saveBgmEnabled(enabled) {
    bgmEnabled = enabled;
    localStorage.setItem('seniExplorer_bgmEnabled', bgmEnabled);
}

// Helper to reset movement flag
function resetMovementFlag() {
    movementCancelled = false;
}

function cancelMovement() {
    movementCancelled = true;
    gameActive = false;
    isMoving = false;
}