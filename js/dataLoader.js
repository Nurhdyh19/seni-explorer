// ============================================================
// dataLoader.js – Load game data YAML and preload images
// ============================================================

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
        document.getElementById('loading-message').innerHTML = t('msg_loading_error', { error: err.message });
        hideSplashScreen();
    }
}