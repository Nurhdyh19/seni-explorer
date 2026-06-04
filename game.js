// ============================================================
// SENI EKSPLORER – Lap-based Racing Game
// ============================================================

let spaceSequence = [];
let spacePositions = [];
let spacesData = {};
let players = [], currentPlayer = 0, rolled = false;
let isMoving = false;
let targetLaps = 4;
let gameActive = true;

const COLORS = ['#E74C3C','#3498DB','#2ECC71','#9B59B6'];
const EMOJIS = ['🎨','🖌️','✏️','🖼️'];

// ---------- NAVIGATION & RESET CONTROL ----------
let movementCancelled = false;

function cancelMovement() {
  movementCancelled = true;
  gameActive = false;
  isMoving = false;
}

function resetMovementFlag() {
  movementCancelled = false;
}

// ---------- SPLASH SCREEN ----------
function hideSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('splash-hidden');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 800);
  }
}

// ---------- SOUND SYSTEM ----------
let audioContext = null;
let sfxEnabled = true;

function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

function playSfx(type) {
  if (!sfxEnabled || !audioContext) return;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.value = 0.15;
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
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    case 'roll':
      osc.frequency.value = 659.25;
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    case 'move':
      osc.frequency.value = 440;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    case 'correct':
      osc.frequency.value = 1046.5;
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.35);
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1318.52;
      gain2.gain.value = 0.1;
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.4);
      break;
    case 'wrong':
      osc.frequency.value = 261.63;
      gain.gain.value = 0.15;
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
    playSfx('click');
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
  };
  document.addEventListener('click', handler);
  document.addEventListener('touchstart', handler);
}

// ---------- IMAGE PRELOADING ----------
function preloadAllSpaceImages() {
  if (!spacesData) return;
  const preloadKeys = [...Object.keys(spacesData), ...spaceSequence];
  preloadKeys.forEach(key => {
    if (key && typeof key === 'string') {
      const img = new Image();
      img.src = `images/${key}.png`;
    }
  });
}

// ---------- LAP & WIN CONDITIONS ----------
function checkWinner() {
  const winner = players.find(p => p.laps >= targetLaps);
  if (winner) {
    gameActive = false;
    playSfx('correct');
    showModalWithImage('🏆 TAHNIAH!', `${winner.emoji} ${winner.name} menang dengan ${winner.laps} pusingan! 🎉`, null, [{label: 'Main Semula', fn: () => location.reload()}]);
    return true;
  }
  return false;
}

// ---------- HELPER FUNCTIONS ----------
function parseChoices(choicesStr) {
  if (!choicesStr) return [];
  return choicesStr.split('|').map(s => s.trim());
}

function getSpaceImageUrl(spaceKey) {
  return `images/${spaceKey}.png`;
}

function addImageToModal(spaceKey, containerId = 'modal-body') {
  const imgUrl = getSpaceImageUrl(spaceKey);
  const img = document.createElement('img');
  img.src = imgUrl;
  img.className = 'modal-image';
  img.style.maxWidth = '200px';
  img.style.maxHeight = '150px';
  img.style.display = 'block';
  img.style.margin = '0 auto 15px auto';
  img.style.borderRadius = '8px';
  img.style.border = '1px solid #F4A820';
  img.onerror = () => img.remove();
  const modalBody = document.getElementById(containerId);
  if (modalBody && modalBody.firstChild) {
    modalBody.insertBefore(img, modalBody.firstChild);
  } else if (modalBody) {
    modalBody.appendChild(img);
  }
}

const DIE_PATTERNS = { 1:[5], 2:[3,7], 3:[3,5,7], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] };

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
  diceContainer.classList.add('rolling');
  playSfx('roll');
  const steps = 16;
  const interval = 25;
  for (let i = 0; i <= steps; i++) {
    if (movementCancelled || !gameActive) {
      rollBtn.disabled = false;
      diceContainer.classList.remove('rolling');
      return;
    }
    if (i === steps) updateDieFace(finalValue);
    else updateDieFace(Math.floor(Math.random() * 6) + 1);
    await new Promise(r => setTimeout(r, interval));
  }
  setTimeout(() => {
    diceContainer.classList.remove('rolling');
    rollBtn.disabled = false;
  }, 100);
}

function addBounceToToken(playerIndex) {
  const tokens = document.querySelectorAll('#tokens-layer .ptoken');
  if (tokens[playerIndex]) {
    tokens[playerIndex].classList.add('bounce');
    setTimeout(() => tokens[playerIndex].classList.remove('bounce'), 200);
  }
}

async function animateStepwise(player, steps) {
  let currentIndex = player.pos;
  const totalSpaces = spaceSequence.length;
  for (let step = 1; step <= steps; step++) {
    if (movementCancelled || !gameActive) return currentIndex;
    let nextIndex = (currentIndex + 1) % totalSpaces;
    // Check if passing MULA (position index wraps from last to 0)
    if (nextIndex < currentIndex && currentIndex !== 0) {
      player.laps++;
      addLog(`${player.emoji} ${player.name} melengkapkan 1 pusingan! (${player.laps}/${targetLaps})`);
      // check winner immediately after lap increment
      if (checkWinner()) return currentIndex; // early exit
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

function buildNameInputs() {
  const numSelect = document.getElementById('num-players');
  if (!numSelect) return;
  const n = parseInt(numSelect.value);
  const container = document.getElementById('name-inputs');
  container.innerHTML = '';
  for (let i = 0; i < n; i++) {
    container.innerHTML += `<div class="setup-row"><label>${EMOJIS[i]} Pemain ${i+1}:</label><input id="pname${i}" type="text" value="Pemain ${i+1}"></div>`;
  }
}

async function loadGameData() {
  try {
    const response = await fetch('game-data.yaml');
    if (!response.ok) throw new Error(`HTTP ${response.status}: fail game-data.yaml tidak dijumpai`);
    const yamlText = await response.text();
    const data = jsyaml.load(yamlText);
    spaceSequence = data.space_sequence;
    spacePositions = data.space_positions;
    spacesData = data.spaces;
    if (!spaceSequence || !spacePositions || !spacesData) throw new Error('Data tidak lengkap');
    
    preloadAllSpaceImages();
    
    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
    buildNameInputs();
    attachHoverSounds();
    
    setTimeout(() => {
      hideSplashScreen();
    }, 500);
  } catch (err) {
    document.getElementById('loading-message').innerHTML = `❌ Ralat: ${err.message}<br>Pastikan fail <strong>game-data.yaml</strong> berada di folder yang sama.`;
    hideSplashScreen();
  }
}

function startGame() {
  // Cancel any ongoing movement before starting fresh
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
    const name = nameInput ? nameInput.value : `Pemain ${i+1}`;
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
  addLog(`🎮 Permainan! Siapa paling cepat ${targetLaps} pusingan menang. 🎮`);
  rolled = false;
  isMoving = false;
  updateDieFace(1);
  updateActiveToken();
  attachHoverSounds();
}

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
    showModalWithImage(`INFO Ruang ${spKey}`, sp.label || 'Tiada keterangan', spKey, [{label:'Tutup', fn: closeModal}]);
  }
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
    textDiv.textContent = `BETUL!`;
    pointsDiv.textContent = `+${pointsEarned} mata`;
    playSfx('correct');
  } else {
    overlay.classList.add('result-wrong');
    overlay.classList.remove('result-correct');
    emojiSpan.textContent = '❌😢';
    textDiv.textContent = `SALAH!`;
    pointsDiv.textContent = correctAnswerLetter ? `Jawapan betul: ${correctAnswerLetter}. ${correctAnswerText}` : `Tiada mata diperoleh.`;
    playSfx('wrong');
  }
  
  if (imageUrl && isCorrect) {
    resultImg.src = imageUrl;
    resultImg.style.display = 'block';
    resultImg.onerror = () => { resultImg.style.display = 'none'; };
  }
  
  overlay.classList.add('show');
  setTimeout(() => {
    overlay.classList.remove('show');
    if (onClose) onClose();
  }, 3000);
}

function showDrawingChallenge(p, spKey, sp, pts) {
  playSfx('modalOpen');
  const modalBody = `
    <div style="font-weight:bold; margin-bottom:10px; color:#F4A820;">🎨 CABARAN LUKISAN DI ATAS KERTAS</div>
    <div style="font-size:14px; margin-bottom:15px;">"${sp.label}"</div>
    <div style="font-size:12px; color:#ccc; margin-bottom:15px;">Lukis jawapan anda di atas kertas. Selepas siap, pilih sama ada lukisan anda betul atau salah.</div>
    <div style="display:flex; gap:10px; justify-content:center; margin-top:5px;">
      <button id="drawing-betul" class="sound-btn" style="background:#2ECC71; color:#fff; border-color:#2ECC71;">✅ Betul (+${pts} mata)</button>
      <button id="drawing-salah" class="sound-btn" style="background:#E74C3C; color:#fff; border-color:#E74C3C;">❌ Salah</button>
      <button id="drawing-skip" class="sound-btn" style="background:#555; color:#fff;">⏭️ Skip</button>
    </div>
  `;
  document.getElementById('modal-title').innerHTML = `✏️ Ruang ${spKey} — Lukis di Kertas`;
  document.getElementById('modal-body').innerHTML = modalBody;
  const btnsDiv = document.getElementById('modal-btns');
  btnsDiv.innerHTML = '';

  addImageToModal(spKey, 'modal-body');
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
        addLog(`🎨 ${p.emoji} ${p.name} melukis dengan betul! +${pts} mata.`);
        renderPlayers();
        closeModal();
        const imageUrl = getSpaceImageUrl(spKey);
        showResult(true, pts, "", "", () => endTurn(), imageUrl);
      };
    }
    if (salahBtn) {
      salahBtn.onclick = () => {
        playSfx('click');
        addLog(`❌ ${p.emoji} ${p.name} mengaku lukisan salah. Tiada mata.`);
        closeModal();
        showResult(false, 0, "", "", () => endTurn(), null);
      };
    }
    if (skipBtn) {
      skipBtn.onclick = () => {
        playSfx('click');
        addLog(`⏭️ ${p.emoji} ${p.name} memilih untuk skip cabaran lukisan. Tiada mata.`);
        closeModal();
        endTurn();
      };
    }
  }, 50);
}

async function rollDice() {
  if (!gameActive) { addLog("Permainan sudah tamat. Muat semula halaman untuk main semula."); return; }
  if (rolled || isMoving) { addLog("⏳ Selesaikan giliran atau tunggu token bergerak."); return; }
  const curr = players[currentPlayer];
  if (curr.jailed) {
    showModalWithImage("🚔 DI PENJARA!", `${curr.emoji} ${curr.name} masih dipenjarakan. Giliran dilangkau!`, 'jail', [{
      label: "OK", fn: () => {
        playSfx('click');
        closeModal();
        addLog(`⛓️ ${curr.name} dalam penjara, langkau giliran.`);
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
  // if game ended during movement, stop further actions
  if (!gameActive || movementCancelled) return;
  await flashCell(finalIndex);
  if (!gameActive || movementCancelled) return;
  const finalKey = spaceSequence[finalIndex];
  const finalSpace = spacesData[finalKey];
  addLog(`${p.emoji} ${p.name}: Dadu ${dieValue} → gerak ke ruang ${finalKey} (${finalSpace.label})`);
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
      showModalWithImage("🚔 GO TO JAIL", `${p.emoji} ${p.name} ditangkap! Anda dipenjarakan dan akan kehilangan giliran seterusnya.`, 'jail', [{
        label: "Okay...", fn: () => {
          playSfx('click');
          p.jailed = true;
          closeModal();
          addLog(`${p.name} dipenjarakan!`);
          renderPlayers();
          endTurn();
        }
      }]);
    } else {
      addLog(`${p.name} tiba di ${sp.label}. Tiada kuiz.`);
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
      <div style="font-size:12px; margin-bottom:8px;">⭐ Nilai: ${pts} mata (pilih jawapan)</div>
      <div id="quiz-options"></div>
    `;
    document.getElementById('modal-title').innerHTML = `📝 Cabaran Seni — Ruang ${spaceKey}`;
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
          addLog(`✅ ${p.emoji} ${p.name} menjawab BETUL! +${pts} mata. (Jawapan: ${letters[idx]})`);
        } else {
          addLog(`❌ ${p.emoji} ${p.name} menjawab SALAH. Jawapan betul: ${correctLetter}. ${correctText}. Tiada mata.`);
        }
        renderPlayers();
        closeModal();
        showResult(isCorrect, pts, correctLetter, correctText, () => endTurn(), null);
      };
      btn.addEventListener('mouseenter', () => playSfx('hover'));
      optionsContainer.appendChild(btn);
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Batal / Skip (tiada mata)';
    cancelBtn.style.backgroundColor = '#444';
    cancelBtn.onclick = () => {
      playSfx('click');
      addLog(`${p.emoji} ${p.name} memilih untuk tidak menjawab. Tiada mata.`);
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

function endTurn() {
  if (!rolled && !isMoving) return;
  playSfx('click');
  rolled = false;
  isMoving = false;
  updateDieFace(1);
  clearHighlight();
  
  // move to next player
  currentPlayer = (currentPlayer + 1) % players.length;
  
  updateTurnLabel();
  renderPlayers();
  updateActiveToken();
  addLog(`🔄 Giliran bertukar kepada ${players[currentPlayer].emoji} ${players[currentPlayer].name}`);
}

function updateTurnLabel() {
  const p = players[currentPlayer];
  const label = document.getElementById('turn-label');
  if (label) label.textContent = `Giliran: ${p.emoji} ${p.name} ${p.jailed ? '(Dipenjara)' : ''}`;
}

function updateActiveToken() {
  const allTokens = document.querySelectorAll('#tokens-layer .ptoken');
  allTokens.forEach(t => t.classList.remove('token-active'));
  if (players[currentPlayer]) {
    const tokens = document.querySelectorAll('#tokens-layer .ptoken');
    if (tokens[currentPlayer]) tokens[currentPlayer].classList.add('token-active');
  }
}

function highlightCell(index) {
  document.querySelectorAll('.cell-hit.highlight').forEach(c => c.classList.remove('highlight'));
  const el = document.getElementById('cell-'+index); if (el) el.classList.add('highlight');
}
function clearHighlight() { document.querySelectorAll('.cell-hit.highlight').forEach(c => c.classList.remove('highlight')); }

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
        <div class="player-score">⭐ ${p.score} mata</div>
        <div class="player-laps">🏁 ${p.laps} / ${targetLaps} pusingan</div>
      </div>
    </div>`
  ).join('');
  attachHoverSounds();
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
  (btns || [{label: 'Tutup', fn: closeModal}]).forEach((b, i) => {
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

// ---------- NAVIGATION FUNCTIONS ----------
function returnToHome() {
  // Cancel any ongoing game activity
  cancelMovement();
  
  // Close any open modals or overlays
  closeModal();
  const resultOverlay = document.getElementById('result-overlay');
  if (resultOverlay) resultOverlay.classList.remove('show');
  
  // Reset game state variables
  gameActive = false;
  rolled = false;
  isMoving = false;
  currentPlayer = 0;
  players = [];
  
  // Hide game area and show setup
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('setup').style.display = 'block';
  
  // Clear log
  const logDiv = document.getElementById('log');
  if (logDiv) logDiv.innerHTML = '';
  
  // Reset turn label
  const turnLabel = document.getElementById('turn-label');
  if (turnLabel) turnLabel.textContent = '';
  
  // Rebuild name inputs to ensure fresh state
  buildNameInputs();
  
  // Reset die face
  updateDieFace(1);
  
  // Reattach hover sounds
  attachHoverSounds();
  
  // Reset movement flag after cleanup
  setTimeout(() => {
    resetMovementFlag();
  }, 100);
  
  playSfx('click');
  addLog("🏠 Kembali ke menu utama.");
}

function restartGame() {
  // Cancel ongoing movement
  cancelMovement();
  
  // Close any open modals
  closeModal();
  const resultOverlay = document.getElementById('result-overlay');
  if (resultOverlay) resultOverlay.classList.remove('show');
  
  // Reset game state flags
  gameActive = false;
  rolled = false;
  isMoving = false;
  
  // Clear log
  const logDiv = document.getElementById('log');
  if (logDiv) logDiv.innerHTML = '';
  
  // Reset movement flag and restart
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
    soundBtn.innerHTML = sfxEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
  }
  playSfx('click');
}

function showGuide() {
  playSfx('modalOpen');
  const guideContent = `
    <div style="text-align: left; font-size: 13px; line-height: 1.6;">
      <p><strong>🎮 Cara Bermain:</strong></p>
      <ul style="margin: 8px 0 12px 20px;">
        <li>Tekan 🎲 <strong>Buang Dadu</strong> untuk membaling dadu.</li>
        <li>Token anda akan bergerak mengikut nombor dadu.</li>
        <li>Mendarat di ruang <strong>Kuiz</strong> → jawab soalan seni untuk dapat mata.</li>
        <li>Mendarat di ruang <strong>Lukisan</strong> → lakukan cabaran lukisan di kertas.</li>
        <li>Lengkapkan <strong>pusingan</strong> untuk meningkatkan lap anda.</li>
        <li>Pemain pertama mencapai ${targetLaps || 4} pusingan akan menang!</li>
      </ul>
      <p><strong>⭐ Mata:</strong></p>
      <ul style="margin: 8px 0 12px 20px;">
        <li>Kuiz betul → dapat mata mengikut nilai ruang.</li>
        <li>Cabaran lukisan → nilai bergantung pada kreativiti.</li>
        <li>Penjara → akan kehilangan giliran seterusnya.</li>
      </ul>
      <p><em>Selamat bermain dan jadi peneroka seni terbaik! 🎨</em></p>
    </div>
  `;
  showModalWithImage("📖 Panduan Permainan", guideContent, null, [{label: "Tutup", fn: closeModal}]);
}

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('num-players')?.addEventListener('change', buildNameInputs);
  document.getElementById('start-btn')?.addEventListener('click', () => { playSfx('click'); startGame(); });
  document.getElementById('roll-btn')?.addEventListener('click', () => { playSfx('click'); rollDice(); });
  
  // Navigation event listeners
  document.getElementById('nav-home')?.addEventListener('click', returnToHome);
  document.getElementById('nav-restart')?.addEventListener('click', restartGame);
  document.getElementById('nav-sound')?.addEventListener('click', toggleSound);
  document.getElementById('nav-guide')?.addEventListener('click', showGuide);
  
  attachHoverSounds();
  enableAudioOnFirstClick();
  loadGameData();
});