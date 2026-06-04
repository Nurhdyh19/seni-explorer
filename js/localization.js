// ============================================================
// localization.js – Loading text and formatting guide
// ============================================================

function t(key, params = {}) {
    let text = uiText[key];
    if (!text) {
        console.warn(`Missing localization key: ${key}`);
        return key;
    }
    for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`{${param}}`, 'g'), value);
    }
    return text;
}

// Convert plain text guide with bullet lines into HTML
function formatGuideText(text) {
    const lines = text.split('\n');
    let inList = false;
    let html = '<div style="text-align: left; font-size: 13px; line-height: 1.6;">';
    
    for (let line of lines) {
        line = line.trim();
        if (line === '') {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<br>';
            continue;
        }
        
        if (line.startsWith('- ')) {
            const bulletText = escapeHtml(line.substring(2));
            if (!inList) {
                html += '<ul style="margin: 8px 0 12px 20px;">';
                inList = true;
            }
            html += `<li>${bulletText}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (line.endsWith(':') || line.match(/^[🎮⭐]/)) {
                html += `<p><strong>${escapeHtml(line)}</strong></p>`;
            } else {
                html += `<p>${escapeHtml(line)}</p>`;
            }
        }
    }
    if (inList) html += '</ul>';
    html += '</div>';
    return html;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function loadLocalization() {
    try {
        const response = await fetch('strings.yaml');
        if (!response.ok) throw new Error(`HTTP ${response.status}: strings.yaml not found`);
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        uiText = data;
        localizationLoaded = true;
        applyLocalizationToUI();
    } catch (err) {
        console.error('Failed to load localization:', err);
        uiText = {};
        localizationLoaded = true;
        applyLocalizationToUI();
    }
}

function applyLocalizationToUI() {
    // Navigation buttons
    const homeBtn = document.getElementById('nav-home');
    if (homeBtn) homeBtn.textContent = t('nav_home');
    const restartBtn = document.getElementById('nav-restart');
    if (restartBtn) restartBtn.textContent = t('nav_restart');
    const soundBtn = document.getElementById('nav-sound');
    if (soundBtn) soundBtn.textContent = sfxEnabled ? t('nav_sound_on') : t('nav_sound_off');
    const guideBtn = document.getElementById('nav-guide');
    if (guideBtn) guideBtn.textContent = t('nav_guide');
    
    // Setup panel
    const setupTitle = document.querySelector('#setup h2');
    if (setupTitle) setupTitle.textContent = t('setup_title');
    const numPlayersLabel = document.querySelector('#setup .setup-row:first-child label');
    if (numPlayersLabel) numPlayersLabel.textContent = t('setup_num_players_label');
    const lapsLabel = document.querySelector('#setup .setup-row:nth-child(2) label');
    if (lapsLabel) lapsLabel.textContent = t('setup_laps_label');
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.textContent = t('setup_start_btn');
    
    // Populate num-players select
    const numSelect = document.getElementById('num-players');
    if (numSelect) {
        const currentVal = numSelect.value;
        numSelect.innerHTML = '';
        for (let i = 2; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = t('setup_num_players_option', { count: i });
            if (currentVal == i) option.selected = true;
            numSelect.appendChild(option);
        }
    }
    
    // Populate target-laps select
    const lapsSelect = document.getElementById('target-laps');
    if (lapsSelect) {
        const currentVal = lapsSelect.value;
        lapsSelect.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = t('setup_laps_option', { count: i });
            if (currentVal == i) option.selected = true;
            lapsSelect.appendChild(option);
        }
    }
    
    // Roll button
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.textContent = t('roll_dice_btn');
    
    // Turn label if game already started
    if (players.length > 0 && currentPlayer < players.length) {
        updateTurnLabel();
    }
    
    attachHoverSounds();
}