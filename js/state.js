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
let uiText = {};
let localizationLoaded = false;

// Helper to reset movement flag
function resetMovementFlag() {
    movementCancelled = false;
}

function cancelMovement() {
    movementCancelled = true;
    gameActive = false;
    isMoving = false;
}