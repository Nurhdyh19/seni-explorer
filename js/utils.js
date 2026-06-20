// ============================================================
// utils.js – Pure helper functions
// ============================================================

function parseChoices(choicesStr) {
    if (!choicesStr) return [];
    return choicesStr.split('|').map(s => s.trim());
}

function getSpaceImageUrl(spaceKey) {
    return `images/${spaceKey}.webp`;
}

function addImageToModal(spaceKey, containerId = 'modal-body') {
    const imgUrl = getSpaceImageUrl(spaceKey);
    const img = document.createElement('img');
    img.src = imgUrl;
    img.className = 'modal-image';
    img.style.cssText = 'max-width:200px; max-height:150px; display:block; margin:0 auto 15px auto; border-radius:8px; border:1px solid #F4A820;';
    img.onerror = () => img.remove();
    const modalBody = document.getElementById(containerId);
    if (modalBody && modalBody.firstChild) {
        modalBody.insertBefore(img, modalBody.firstChild);
    } else if (modalBody) {
        modalBody.appendChild(img);
    }
}

function updateDieFace(value) {
    const dots = document.querySelectorAll('#die .dot');
    dots.forEach(dot => dot.classList.remove('lit'));
    const positions = DIE_PATTERNS[value];
    if (positions) positions.forEach(pos => { if (dots[pos-1]) dots[pos-1].classList.add('lit'); });
}

async function animateRoll(finalValue) {
    const rollBtn = document.getElementById('roll-btn');
    rollBtn.disabled = true;
    const diceContainer = document.getElementById('dice-display');
    diceContainer.classList.remove('bounce');
    diceContainer.classList.add('rolling');
    playSfx('roll');
    const steps = 20;
    let interval = 40;
    for (let i = 0; i <= steps; i++) {
        if (movementCancelled || !gameActive) {
            rollBtn.disabled = false;
            diceContainer.classList.remove('rolling');
            return;
        }
        if (i === steps) {
            updateDieFace(finalValue);
        } else {
            updateDieFace(Math.floor(Math.random() * 6) + 1);
            if (i % 2 === 0) playSfx('diceTick');
        }
        if (i < 12) interval = 40 + (i < 4 ? i * 10 : 0);
        else interval = Math.max(30, 40 - (i - 12) * 8);
        await new Promise(r => setTimeout(r, interval));
    }
    setTimeout(() => {
        diceContainer.classList.remove('rolling');
        diceContainer.classList.add('bounce');
        playSfx('diceLand');
        rollBtn.disabled = false;
        setTimeout(() => diceContainer.classList.remove('bounce'), 600);
    }, 120);
}

function addBounceToToken(playerIndex) {
    const tokens = document.querySelectorAll('#tokens-layer .ptoken');
    if (tokens[playerIndex]) {
        tokens[playerIndex].classList.add('bounce');
        setTimeout(() => tokens[playerIndex].classList.remove('bounce'), 200);
    }
}

function flashCell(index) {
    return new Promise((resolve) => {
        const cell = document.getElementById('cell-' + index);
        if (!cell) { resolve(); return; }
        cell.classList.add('cell-flash');
        setTimeout(() => {
            cell.classList.remove('cell-flash');
            resolve();
        }, 650);
    });
}

function highlightCell(index) {
    document.querySelectorAll('.cell-hit.highlight').forEach(c => c.classList.remove('highlight'));
    const el = document.getElementById('cell-'+index); if (el) el.classList.add('highlight');
}

function clearHighlight() {
    document.querySelectorAll('.cell-hit.highlight').forEach(c => c.classList.remove('highlight'));
}

function addEvent(msg) {
    const input = document.getElementById('game-feed');
    if (!input) return;
    input.value = '› ' + msg;
}

function buildNameInputs() {
    const numSelect = document.getElementById('num-players');
    if (!numSelect) return;
    const n = parseInt(numSelect.value);
    const container = document.getElementById('name-inputs');
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const emoji = EMOJIS[i];
        container.innerHTML += `<div class="setup-row"><label>${t('player_name_label', { number: i+1, emoji: emoji })}</label><input id="pname${i}" type="text" value="${t('player_name_placeholder', { number: i+1 })}"></div>`;
    }
}