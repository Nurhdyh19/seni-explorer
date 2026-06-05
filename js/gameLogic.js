// ============================================================
// gameLogic.js – Core gameplay: rolling, landing, turn handling
// ============================================================

function checkWinner() {
    const winner = players.find(p => p.laps >= targetLaps);
    if (winner) {
        gameActive = false;
        playSfx('correct');
        showModalWithImage(
            t('modal_winner_title'),
            t('modal_winner_message', { emoji: winner.emoji, name: winner.name, laps: winner.laps }),
            null,
            [{ label: t('modal_play_again'), fn: () => location.reload() }]
        );
        return true;
    }
    return false;
}

async function rollDice() {
    if (!gameActive) { addLog(t('msg_game_ended')); return; }
    if (rolled || isMoving) { addLog(t('msg_wait_turn')); return; }
    const curr = players[currentPlayer];
    if (curr.jailed) {
        showModalWithImage(t('modal_jail_title'), t('modal_jail_message', { emoji: curr.emoji, name: curr.name }), 'jail', [{
            label: t('modal_ok_btn'), fn: () => {
                playSfx('click');
                closeModal();
                addLog(t('log_jailed_turn_skipped', { name: curr.name }));
                curr.jailed = false;
                endTurn();
            }
        }]);
        return;
    }
    
    const dieValue = Math.floor(Math.random() * 6) + 1;
    await animateRoll(dieValue);
    if (movementCancelled || !gameActive) return;
    rolled = true;
    isMoving = true;
    const p = players[currentPlayer];
    const finalIndex = await animateStepwise(p, dieValue);
    if (!gameActive || movementCancelled) return;
    await flashCell(finalIndex);
    if (!gameActive || movementCancelled) return;
    const finalKey = spaceSequence[finalIndex];
    const finalSpace = spacesData[finalKey];
    addLog(t('log_rolled_moved', { emoji: p.emoji, name: p.name, dice: dieValue, spaceKey: finalKey, spaceLabel: finalSpace.label }));
    renderPlayers();
    await new Promise(r => setTimeout(r, 300));
    if (!gameActive || movementCancelled) return;
    handleLanding(p, finalIndex);
}

function handleLanding(p, spaceIndex) {
    const spaceKey = spaceSequence[spaceIndex];
    const sp = spacesData[spaceKey];
    if (!sp) return;
    if (sp.type === 'corner') {
        if (spaceKey === 'jail') {
            showModalWithImage(t('modal_jail_landing_title'), t('modal_jail_landing_message', { emoji: p.emoji, name: p.name }), 'jail', [{
                label: t('modal_jail_ok_btn'), fn: () => {
                    playSfx('click');
                    p.jailed = true;
                    closeModal();
                    addLog(t('log_jailed', { name: p.name }));
                    renderPlayers();
                    endTurn();
                }
            }]);
        } else {
            addLog(t('msg_corner_no_quiz', { name: p.name, label: sp.label }));
            endTurn();
        }
        return;
    }
    if (sp.type === 'drawing') {
        const pts = sp.points || 3;
        showDrawingChallenge(p, spaceKey, sp, pts);
        return;
    }
    if (sp.type === 'quiz') {
        const pts = sp.points || 1;
        const choices = parseChoices(sp.choices);
        const answerIndex = (sp.answer || 1) - 1;
        const letters = ['A', 'B', 'C', 'D'];
        playSfx('modalOpen');
        const modalBody = `
            <div style="font-weight:bold; margin-bottom:10px; color:#F4A820;">🎨 ${sp.label}</div>
            <div style="font-size:12px; margin-bottom:8px;">${t('quiz_points_label', { points: pts })}</div>
            <div id="quiz-options"></div>
        `;
        document.getElementById('modal-title').innerHTML = t('quiz_title', { spaceKey: spaceKey });
        document.getElementById('modal-body').innerHTML = modalBody;
        const btnsDiv = document.getElementById('modal-btns');
        btnsDiv.innerHTML = '';
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        addImageToModal(spaceKey, 'modal-body');
        
        choices.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-opt-btn';
            btn.innerHTML = `<span class="opt-prefix">${letters[idx]}</span> <span>${opt}</span>`;
            btn.onclick = () => {
                playSfx('click');
                const isCorrect = (idx === answerIndex);
                const correctLetter = letters[answerIndex];
                const correctText = choices[answerIndex];
                if (isCorrect) {
                    p.score += pts;
                    addLog(t('quiz_log_correct', { emoji: p.emoji, name: p.name, points: pts, answer: letters[idx] }));
                } else {
                    addLog(t('quiz_log_wrong', { emoji: p.emoji, name: p.name, correctLetter: correctLetter, correctText: correctText }));
                }
                renderPlayers();
                closeModal();
                showResult(isCorrect, pts, correctLetter, correctText, () => endTurn(), null);
            };
            btn.addEventListener('mouseenter', () => playSfx('hover'));
            optionsContainer.appendChild(btn);
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = t('modal_skip_btn');
        cancelBtn.style.backgroundColor = '#444';
        cancelBtn.onclick = () => {
            playSfx('click');
            addLog(t('quiz_log_skip', { emoji: p.emoji, name: p.name }));
            closeModal();
            endTurn();
        };
        cancelBtn.addEventListener('mouseenter', () => playSfx('hover'));
        btnsDiv.appendChild(cancelBtn);
        document.getElementById('modal').classList.add('show');
        attachHoverSounds();
        return;
    }
    endTurn();
}

function showDrawingChallenge(p, spaceKey, sp, pts) {
    playSfx('modalOpen');
    const modalBody = `
        <div style="font-weight:bold; margin-bottom:10px; color:#F4A820;">${t('drawing_challenge_title')}</div>
        <div style="font-size:14px; margin-bottom:15px;">"${sp.label}"</div>
        <div style="font-size:12px; color:#ccc; margin-bottom:15px;">${t('drawing_instruction')}</div>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:5px;">
            <button id="drawing-betul" class="sound-btn" style="background:#2ECC71; color:#fff; border-color:#2ECC71;">${t('drawing_btn_correct', { points: pts })}</button>
            <button id="drawing-salah" class="sound-btn" style="background:#E74C3C; color:#fff; border-color:#E74C3C;">${t('drawing_btn_wrong')}</button>
            <button id="drawing-skip" class="sound-btn" style="background:#555; color:#fff;">${t('drawing_btn_skip')}</button>
        </div>
    `;
    document.getElementById('modal-title').innerHTML = t('drawing_title', { spaceKey: spaceKey });
    document.getElementById('modal-body').innerHTML = modalBody;
    const btnsDiv = document.getElementById('modal-btns');
    btnsDiv.innerHTML = '';

    addImageToModal(spaceKey, 'modal-body');
    document.getElementById('modal').classList.add('show');
    attachHoverSounds();

    setTimeout(() => {
        const betulBtn = document.getElementById('drawing-betul');
        const salahBtn = document.getElementById('drawing-salah');
        const skipBtn = document.getElementById('drawing-skip');
        if (betulBtn) {
            betulBtn.onclick = () => {
                playSfx('click');
                p.score += pts;
                addLog(t('drawing_log_correct', { emoji: p.emoji, name: p.name, points: pts }));
                renderPlayers();
                closeModal();
                const imageUrl = getSpaceImageUrl(spaceKey);
                showResult(true, pts, "", "", () => endTurn(), imageUrl);
            };
        }
        if (salahBtn) {
            salahBtn.onclick = () => {
                playSfx('click');
                addLog(t('drawing_log_wrong', { emoji: p.emoji, name: p.name }));
                closeModal();
                showResult(false, 0, "", "", () => endTurn(), null);
            };
        }
        if (skipBtn) {
            skipBtn.onclick = () => {
                playSfx('click');
                addLog(t('drawing_log_skip', { emoji: p.emoji, name: p.name }));
                closeModal();
                endTurn();
            };
        }
    }, 50);
}

function endTurn() {
    if (!rolled && !isMoving) return;
    playSfx('click');
    rolled = false;
    isMoving = false;
    updateDieFace(1);
    clearHighlight();
    
    currentPlayer = (currentPlayer + 1) % players.length;
    
    updateTurnLabel();
    renderPlayers();
    updateActiveToken();
    addLog(t('log_turn_change', { emoji: players[currentPlayer].emoji, name: players[currentPlayer].name }));
}

function startGame() {
    cancelMovement();
    resetMovementFlag();
    
    playSfx('click');
    const numSelect = document.getElementById('num-players');
    const n = parseInt(numSelect.value);
    targetLaps = parseInt(document.getElementById('target-laps').value);
    gameActive = true;
    
    players = [];
    for (let i = 0; i < n; i++) {
        const nameInput = document.getElementById('pname' + i);
        const name = nameInput ? nameInput.value : t('player_name_placeholder', { number: i+1 });
        const startIndex = spaceSequence.indexOf('start');
        players.push({
            name,
            pos: startIndex,
            score: 0,
            laps: 0,
            color: COLORS[i],
            emoji: EMOJIS[i],
            jailed: false
        });
    }
    document.getElementById('setup').style.display = 'none';
    document.getElementById('game-area').style.display = 'flex';
    buildCells();
    renderTokens();
    renderPlayers();
    addLog(t('game_start_log', { laps: targetLaps }));
    rolled = false;
    isMoving = false;
    updateDieFace(1);
    updateActiveToken();
    attachHoverSounds();
}

function returnToHome() {
    // Cancel any ongoing game activity
    cancelMovement();
    closeModal();
    
    // Reset game state variables
    gameActive = false;
    rolled = false;
    isMoving = false;
    players = [];
    currentPlayer = 0;
    
    // Hide game area and setup panel
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('setup').style.display = 'none';
    
    // Show splash screen and remove hidden class
    const splash = document.getElementById('splash-screen');
    splash.style.display = 'flex';
    splash.classList.remove('splash-hidden');
    
    // After splash animation, hide splash and show setup again
    setTimeout(() => {
        splash.classList.add('splash-hidden');
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('setup').style.display = 'block';
            buildNameInputs();      // Rebuild player name inputs
            attachHoverSounds();
        }, 800);
    }, 1500);  // Show splash for 1.5 seconds before fading
    
    playSfx('click');
    addLog(t('log_cancel_return'));
}

function restartGame() {
    cancelMovement();
    closeModal();
    const resultOverlay = document.getElementById('result-overlay');
    if (resultOverlay) resultOverlay.classList.remove('show');
    
    gameActive = false;
    rolled = false;
    isMoving = false;
    
    const logDiv = document.getElementById('log');
    if (logDiv) logDiv.innerHTML = '';
    
    setTimeout(() => {
        resetMovementFlag();
        startGame();
    }, 50);
    
    playSfx('click');
}

function toggleSound() {
    sfxEnabled = !sfxEnabled;
    const soundBtn = document.getElementById('nav-sound');
    if (soundBtn) {
        soundBtn.innerHTML = sfxEnabled ? t('nav_sound_on') : t('nav_sound_off');
    }
    playSfx('click');
}

function toggleBgm() {
    toggleBackgroundMusic();
    const musicBtn = document.getElementById('nav-music');
    if (musicBtn) {
        musicBtn.textContent = bgmEnabled ? t('nav_music_on') : t('nav_music_off');
    }
    playSfx('click');
}

function showGuide() {
    playSfx('modalOpen');
    let rawGuide = t('guide_content', { laps: targetLaps });
    const formattedGuide = formatGuideText(rawGuide);
    showModalWithImage(t('guide_title'), formattedGuide, null, [{label: t('modal_close_btn'), fn: closeModal}]);
}