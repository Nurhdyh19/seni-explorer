// ============================================================
// animations.js – Player movement and step animation
// ============================================================

async function animateStepwise(player, steps) {
    let currentIndex = player.pos;
    const totalSpaces = spaceSequence.length;
    for (let step = 1; step <= steps; step++) {
        if (movementCancelled || !gameActive) return currentIndex;
        let nextIndex = (currentIndex + 1) % totalSpaces;
        if (nextIndex < currentIndex && currentIndex !== 0) {
            player.laps++;
            addLog(t('log_lap_complete', { emoji: player.emoji, name: player.name, laps: player.laps, target: targetLaps }));
            if (checkWinner()) return currentIndex;
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
    return currentIndex;
}