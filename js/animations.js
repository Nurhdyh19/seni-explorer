// ============================================================
// animations.js – Player movement and step animation
// ============================================================

const FADE_MS = 300;
const BOARD_TRANSITION_MS = 400;

let _boardNaturalSize = null;
let _isBoardFullscreen = false;
let _boardAnimating = false;

function setUIVisible(visible) {
    const gameArea = document.getElementById('game-area');
    gameArea.classList.toggle('board-is-expanding', !visible);
    gameArea.classList.toggle('board-is-fullscreen', !visible);
    document.body.classList.toggle('board-is-expanding', !visible);
    document.body.classList.toggle('board-is-fullscreen', !visible);
}

async function expandBoard() {
    const board = document.getElementById('board-wrap');
    const rect = board.getBoundingClientRect();
    _boardNaturalSize = rect.width;
    setUIVisible(false);
    await new Promise(r => setTimeout(r, FADE_MS));
    board.style.width = _boardNaturalSize + 'px';
    board.style.height = _boardNaturalSize + 'px';
    board.classList.add('board-animating');
    board.getBoundingClientRect();
    const full = Math.min(window.innerWidth, window.innerHeight);
    board.style.width = full + 'px';
    board.style.height = full + 'px';
    _isBoardFullscreen = true;
    await new Promise(r => setTimeout(r, BOARD_TRANSITION_MS));
}

async function collapseBoard(delay = 800) {
    return new Promise(r => setTimeout(async () => {
        const board = document.getElementById('board-wrap');
        board.style.width = _boardNaturalSize + 'px';
        board.style.height = _boardNaturalSize + 'px';
        await new Promise(r2 => setTimeout(r2, BOARD_TRANSITION_MS));
        board.classList.remove('board-animating');
        board.style.width = '';
        board.style.height = '';
        _isBoardFullscreen = false;
        setUIVisible(true);
        await new Promise(r2 => setTimeout(r2, FADE_MS));
        r();
    }, delay));
}

async function toggleBoardSize() {
    if (_boardAnimating) return;
    _boardAnimating = true;
    if (_isBoardFullscreen) {
        await collapseBoard(0);
    } else {
        await expandBoard();
    }
    _boardAnimating = false;
}

function initBoardClickToggle() {
    const board = document.getElementById('board-wrap');
    board.addEventListener('click', (e) => {
        // Don't trigger if clicking a cell (cell has its own handler)
        if (e.target.classList.contains('cell-hit') || e.target.closest('.cell-hit')) return;
        toggleBoardSize();
    });
}

async function animateStepwise(player, steps) {
    await expandBoard();
    await new Promise(r => setTimeout(r, 200));
    let currentIndex = player.pos;
    const totalSpaces = spaceSequence.length;
    for (let step = 1; step <= steps; step++) {
        if (movementCancelled || !gameActive) {
            await collapseBoard(0);
            return currentIndex;
        }
        let nextIndex = (currentIndex + 1) % totalSpaces;
        if (nextIndex < currentIndex && currentIndex !== 0) {
            player.laps++;
            addLog(t('log_lap_complete', { emoji: player.emoji, name: player.name, laps: player.laps, target: targetLaps }));
            if (checkWinner()) {
                await collapseBoard(0);
                return currentIndex;
            }
        }
        player.pos = nextIndex;
        renderTokens();
        addBounceToToken(players.indexOf(player));
        highlightCell(nextIndex);
        playSfx('move');
        await new Promise(r => setTimeout(r, 250));
        currentIndex = nextIndex;
    }
    clearHighlight();
    renderPlayers();
    await collapseBoard(1400);
    return currentIndex;
}