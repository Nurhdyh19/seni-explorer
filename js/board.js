// ============================================================
// board.js – Board rendering, cells, tokens, modals, log
// ============================================================

function buildCells() {
    const layer = document.getElementById('cells-layer');
    layer.innerHTML = '';
    spacePositions.forEach(([lp, tp], idx) => {
        const spKey = spaceSequence[idx];
        const sp = spacesData[spKey];
        if (!sp) return;
        const isCorner = sp.type === 'corner';
        const w = isCorner ? 13.3 : 7.1;
        const h = isCorner ? 13.3 : 7.1;
        const el = document.createElement('div');
        el.className = 'cell-hit';
        el.id = 'cell-' + idx;
        el.style.cssText = `left:${lp - w/2}%;top:${tp - h/2}%;width:${w}%;height:${h}%;`;
        el.title = sp.label;
        el.onclick = (e) => { e.stopPropagation(); playSfx('click'); onCellClick(idx); };
        el.addEventListener('mouseenter', () => playSfx('hover'));
        layer.appendChild(el);
    });
}

function onCellClick(idx) {
    const spKey = spaceSequence[idx];
    const sp = spacesData[spKey];
    if (sp) {
        showModalWithImage(t('modal_info_title', { spaceKey: spKey }), sp.label || 'Tiada keterangan', spKey, [{label: t('modal_close_btn'), fn: closeModal}]);
    }
}

function renderTokens() {
    const layer = document.getElementById('tokens-layer');
    if (!layer) return;
    layer.innerHTML = '';
    players.forEach((p, i) => {
        const [lp, tp] = spacePositions[p.pos] || [50, 50];
        const offsets = [[0,0], [3.5,0], [0,3.5], [3.5,3.5]];
        const [ox, oy] = offsets[i % 4];
        const el = document.createElement('div');
        el.className = 'ptoken';
        el.style.left = (lp + ox * 0.8) + '%';
        el.style.top = (tp + oy * 0.8) + '%';
        el.style.background = p.color;
        el.textContent = p.emoji;
        layer.appendChild(el);
    });
    updateActiveToken();
}

function renderPlayers() {
    const container = document.getElementById('players-row');
    container.innerHTML = players.map((p, i) =>
        `<div class="player-card${i === currentPlayer ? ' active' : ''}">
            <div class="token-badge" style="background:${p.color}">${p.emoji}</div>
            <div>
                <div class="player-name">${p.name} ${p.jailed ? '🚫' : ''}</div>
                <div class="player-score">${t('player_score_label', { score: p.score })}</div>
                <div class="player-laps">${t('player_laps_label', { laps: p.laps, target: targetLaps })}</div>
            </div>
        </div>`
    ).join('');
    attachHoverSounds();
}

function updateActiveToken() {
    const allTokens = document.querySelectorAll('#tokens-layer .ptoken');
    allTokens.forEach(t => t.classList.remove('token-active'));
    if (players[currentPlayer]) {
        const tokens = document.querySelectorAll('#tokens-layer .ptoken');
        if (tokens[currentPlayer]) tokens[currentPlayer].classList.add('token-active');
    }
}

function updateTurnLabel() {
    const p = players[currentPlayer];
    const jailedSuffix = p.jailed ? t('turn_label_jailed_suffix') : '';
    const label = document.getElementById('turn-label');
    if (label) label.textContent = t('turn_label_format', { emoji: p.emoji, name: p.name, jailed: jailedSuffix });
}

function addLog(msg) {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML += `<div>› ${msg}</div>`;
    logDiv.parentElement.scrollTop = logDiv.parentElement.scrollHeight;
}

function showModalWithImage(title, body, imageKey, btns) {
    playSfx('modalOpen');
    document.getElementById('modal-title').textContent = title;
    const mb = document.getElementById('modal-body');
    if (typeof body === 'string') mb.innerHTML = body.replace(/\n/g, '<br>');
    else mb.innerHTML = body;
    const bc = document.getElementById('modal-btns');
    bc.innerHTML = '';
    (btns || [{label: t('modal_close_btn'), fn: closeModal}]).forEach((b, i) => {
        const btn = document.createElement('button');
        btn.textContent = b.label;
        if (i === 0) btn.style.cssText = 'background:#F4A820;color:#1a1a2e;border-color:#F4A820';
        btn.onclick = () => { playSfx('click'); b.fn(); };
        btn.addEventListener('mouseenter', () => playSfx('hover'));
        bc.appendChild(btn);
    });
    if (imageKey) {
        addImageToModal(imageKey, 'modal-body');
    }
    document.getElementById('modal').classList.add('show');
    attachHoverSounds();
}

function closeModal() {
    playSfx('modalClose');
    document.getElementById('modal').classList.remove('show');
}

function showResult(isCorrect, pointsEarned, correctAnswerLetter, correctAnswerText, onClose, imageUrl = null) {
    const overlay = document.getElementById('result-overlay');
    const emojiSpan = document.getElementById('result-emoji');
    const textDiv = document.getElementById('result-text');
    const pointsDiv = document.getElementById('result-points');
    const resultImg = document.getElementById('result-image');
    
    resultImg.style.display = 'none';
    resultImg.src = '';
    
    if (isCorrect) {
        overlay.classList.add('result-correct');
        overlay.classList.remove('result-wrong');
        emojiSpan.textContent = '✅🎉';
        textDiv.textContent = t('result_correct_title');
        pointsDiv.textContent = t('result_points_format', { points: pointsEarned });
        playSfx('correct');
    } else {
        overlay.classList.add('result-wrong');
        overlay.classList.remove('result-correct');
        emojiSpan.textContent = '❌😢';
        textDiv.textContent = t('result_wrong_title');
        pointsDiv.textContent = correctAnswerLetter ? t('result_wrong_answer_format', { letter: correctAnswerLetter, text: correctAnswerText }) : `Tiada mata diperoleh.`;
        playSfx('wrong');
    }
    
    if (imageUrl && isCorrect) {
        resultImg.src = imageUrl;
        resultImg.style.display = 'block';
        resultImg.onerror = () => { resultImg.style.display = 'none'; };
    }
    
    overlay.classList.add('show');
    let resultTimeoutId = setTimeout(() => {
        overlay.classList.remove('show');
        if (onClose) onClose();
    }, 3000);
    
    // Allow skipping by clicking anywhere on the page (after a short delay to prevent immediate close)
    setTimeout(() => {
        const skipHandler = (e) => {
            clearTimeout(resultTimeoutId);
            overlay.classList.remove('show');
            document.removeEventListener('click', skipHandler);
            if (onClose) onClose();
        };
        document.addEventListener('click', skipHandler);
    }, 100);
}