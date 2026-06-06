// ============================================================
// animations.js – Player movement and step animation
// ============================================================

function expandBoard() {
    const board = document.getElementById('board-wrap');
    const backdrop = document.getElementById('board-backdrop');
    if (board) board.classList.add('board-fullscreen');
    if (backdrop) backdrop.classList.add('show');
}

function collapseBoard(delay = 800) {
    return new Promise(r => setTimeout(() => {
        const board = document.getElementById('board-wrap');
        const backdrop = document.getElementById('board-backdrop');
        if (board) board.classList.remove('board-fullscreen');
        if (backdrop) backdrop.classList.remove('show');
        setTimeout(r, 350); // wait for transition to finish
    }, delay));
}

async function animateStepwise(player, steps) {
    expandBoard();
    await new Promise(r => setTimeout(r, 600)); // delay before movement starts
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