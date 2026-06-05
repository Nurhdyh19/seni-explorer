// ============================================================
// main.js – Initialisation and event binding
// ============================================================

function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('splash-hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 800);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('num-players')?.addEventListener('change', buildNameInputs);
    document.getElementById('start-btn')?.addEventListener('click', () => { playSfx('click'); startGame(); });
    document.getElementById('roll-btn')?.addEventListener('click', async () => { 
        const resultOverlay = document.getElementById('result-overlay');
        if (resultOverlay && resultOverlay.classList.contains('show')) {
            resultOverlay.classList.remove('show');
            endTurn();
        }
        playSfx('click'); 
        await rollDice(); 
    });
    
    document.getElementById('nav-home')?.addEventListener('click', returnToHome);
    document.getElementById('nav-restart')?.addEventListener('click', restartGame);
    document.getElementById('nav-sound')?.addEventListener('click', toggleSound);
    document.getElementById('nav-music')?.addEventListener('click', toggleBgm);
    document.getElementById('nav-guide')?.addEventListener('click', showGuide);
    
    attachHoverSounds();
    enableAudioOnFirstClick();
    initBackgroundMusic();
    
    // Load localization first, then game data (or in parallel)
    loadLocalization().then(() => {
        loadGameData();
    }).catch(() => loadGameData());
});