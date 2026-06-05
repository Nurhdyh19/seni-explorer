// ============================================================
// main.js – Initialisation and event binding
// ============================================================

let deferredInstallPrompt = null;

function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('splash-hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 800);
    }
}

function showInstallButton(show = true) {
    const installBtn = document.getElementById('nav-install');
    if (!installBtn) return;
    installBtn.style.display = show ? 'inline-flex' : 'none';
}

function setInstallButtonLabel() {
    const installBtn = document.getElementById('nav-install');
    if (installBtn) {
        installBtn.textContent = t('nav_install');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load volume settings from localStorage
    loadVolumeSettings();
    
    // Initialize volume sliders with saved values (settings panel only)
    const musicVolumeSliderModal = document.getElementById('music-volume-slider-modal');
    const sfxVolumeSliderModal = document.getElementById('sfx-volume-slider-modal');
    
    // Helper function to update volume displays and sliders
    function updateAllVolumeSliders() {
        const musicValue = Math.round(musicVolume * 100);
        const sfxValue = Math.round(sfxVolume * 100);
        
        // Update settings panel sliders
        if (musicVolumeSliderModal) {
            musicVolumeSliderModal.value = musicValue;
            musicVolumeSliderModal.style.setProperty('--value', musicValue + '%');
        }
        if (sfxVolumeSliderModal) {
            sfxVolumeSliderModal.value = sfxValue;
            sfxVolumeSliderModal.style.setProperty('--value', sfxValue + '%');
        }
        
        // Update displays
        document.getElementById('music-vol-display-modal').textContent = musicValue;
        document.getElementById('sfx-vol-display-modal').textContent = sfxValue;
    }
    
    // Initialize sliders
    updateAllVolumeSliders();
    
    // Settings panel sliders
    if (musicVolumeSliderModal) {
        musicVolumeSliderModal.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            saveMusicVolume(vol);
            updateAllVolumeSliders();
        });
    }
    
    if (sfxVolumeSliderModal) {
        sfxVolumeSliderModal.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            saveSfxVolume(vol);
            updateAllVolumeSliders();
        });
    }
    
    // Settings panel functions
    function openSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.add('show');
            playSfx('click');
        }
    }
    
    function closeSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.remove('show');
            playSfx('modalClose');
        }
    }
    
    document.getElementById('nav-settings')?.addEventListener('click', openSettings);
    document.getElementById('settings-close')?.addEventListener('click', closeSettings);
    
    // Close settings panel when clicking outside
    document.getElementById('settings-panel')?.addEventListener('click', (e) => {
        if (e.target.id === 'settings-panel') {
            closeSettings();
        }
    });
    
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
    document.getElementById('nav-install')?.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        showInstallButton(false);
        console.log('Install prompt choice:', choiceResult.outcome);
    });
    document.getElementById('nav-guide')?.addEventListener('click', showGuide);
    
    attachHoverSounds();
    enableAudioOnFirstClick();
    initBackgroundMusic();
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        setInstallButtonLabel();
        showInstallButton(true);
    });
    
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        showInstallButton(false);
        console.log('App successfully installed');
    });
    
    // Load localization first, then game data (or in parallel)
    loadLocalization().then(() => {
        loadGameData();
    }).catch(() => loadGameData());
});