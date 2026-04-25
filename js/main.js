window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const mainMenu = document.getElementById('main-menu');
    const pauseMenu = document.getElementById('pause-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const upgradeMenu = document.getElementById('upgrade-menu');
    const upgradeTitle = document.getElementById('upgrade-title');

    const startBtn = document.getElementById('start-btn');
    const bossRushBtn = document.getElementById('boss-rush-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const pauseToMainBtn = document.getElementById('pause-main-btn');
    const gameOverRestartBtn = document.getElementById('gameover-restart-btn');
    const gameOverMainBtn = document.getElementById('gameover-main-btn');

    const isMobileDevice = () => {
        return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    };

    const computeCanvasSize = () => {
        if (!isMobileDevice()) {
            return { width: 600, height: 800 };
        }

        const viewport = window.visualViewport;
        const width = Math.floor(viewport ? viewport.width : window.innerWidth);
        const height = Math.floor(viewport ? viewport.height : window.innerHeight);
        return { width, height };
    };

    const applyCanvasSize = () => {
        const { width, height } = computeCanvasSize();
        canvas.width = width;
        canvas.height = height;

        if (game) {
            game.resize(width, height);
        }
    };

    let game = null;

    applyCanvasSize();

    // Create the game instance
    game = new Game(canvas.width, canvas.height, canvas);

    const fps = 60;
    const interval = 1000 / fps;
    let then = performance.now();

    let currentBossRush = false;

    const hideAllMenus = () => {
        mainMenu.classList.add('hidden');
        pauseMenu.classList.add('hidden');
        gameOverMenu.classList.add('hidden');
        upgradeMenu.classList.add('hidden');
    };

    let gameOverLocked = false;

    const setupMenuKeyboardNavigation = (menuButtons, isMenuActive) => {
        let selectedIndex = 0;

        const focusCurrentButton = () => {
            if (menuButtons.length === 0) return;
            menuButtons[selectedIndex].focus();
        };

        menuButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => {
                if (gameOverLocked && !gameOverMenu.classList.contains('hidden')) return;
                selectedIndex = index;
                focusCurrentButton();
            });
        });

        const handleMenuKeydown = (e) => {
            if (!isMenuActive()) return;
            if (gameOverLocked && !gameOverMenu.classList.contains('hidden')) return;

            if (['ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : menuButtons.length - 1;
                focusCurrentButton();
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex < menuButtons.length - 1) ? selectedIndex + 1 : 0;
                focusCurrentButton();
            } else if (['Enter', 'Space'].includes(e.code)) {
                e.preventDefault();
                menuButtons[selectedIndex].click();
            }
        };

        window.addEventListener('keydown', handleMenuKeydown);

        return {
            focusFirst: () => {
                selectedIndex = 0;
                focusCurrentButton();
            }
        };
    };

    const updateGameOverStats = () => {
        const statsContainer = document.getElementById('game-over-stats');
        const s = game.stats;
        
        // Calcul du temps (MM:SS)
        const totalSeconds = Math.floor(s.timePlayed / 60);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        const timeStr = `${mins}:${secs}`;

        const accuracy = s.projectilesFired > 0 ? Math.round((s.projectilesHit / s.projectilesFired) * 100) : 0;

        statsContainer.innerHTML = `
            <div class="stat-item"><span>Time:</span> <strong>${timeStr}</strong></div>
            <div class="stat-item"><span>Waves:</span> <strong>${s.wavesCleared}</strong></div>
            <div class="stat-item"><span>Kills:</span> <strong>${s.enemiesKilled}</strong></div>
            <div class="stat-item"><span>Bosses:</span> <strong>${s.bossesDefeated}</strong></div>
            <div class="stat-item"><span>Damage Dealt:</span> <strong>${s.damageDealt.toLocaleString()}</strong></div>
            <div class="stat-item"><span>Damage Taken:</span> <strong>${s.damageTaken}</strong></div>
            <div class="stat-item"><span>Shots Fired:</span> <strong>${s.projectilesFired}</strong></div>
            <div class="stat-item"><span>Accuracy:</span> <strong>${accuracy}%</strong></div>
            <div class="stat-item"><span>Crits:</span> <strong>${s.criticalHits}</strong></div>
            <div class="stat-item"><span>Upgrades:</span> <strong>${s.upgradesPicked}</strong></div>
        `;
    };

    const startNewRun = (bossRushMode) => {
        currentBossRush = bossRushMode;
        hideAllMenus();
        game.startGame({ bossRush: bossRushMode });
        canvas.focus();
    };

    const showMainMenu = () => {
        game.reset({ bossRush: false });
        hideAllMenus();
        mainMenu.classList.remove('hidden');
        mainMenuKeyboard.focusFirst();
    };

    function animate(now) {
        requestAnimationFrame(animate);

        const delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

            // Gestion de la visibilité du curseur
            if (game.gameState === 'PLAYING') {
                canvas.style.cursor = 'none';
            } else {
                canvas.style.cursor = 'default';
            }

            game.update();
            game.draw(ctx);
        }
    }

    // Handle Upgrades
    window.addEventListener('waveCleared', (event) => {
        const wasBossWave = event.detail?.wasBossWave === true;
        const shouldOpenRewardMenu = wasBossWave || event.detail?.shouldOpenRewardMenu === true;

        if (!shouldOpenRewardMenu) {
            // Normal wave cleared: no upgrade menu, and make sure wording bug does not appear.
            return;
        }

        const upgradeOptions = document.getElementById('upgrade-options');
        const optionCount = 3 + game.player.upgradeChoicesBonus;
        let rerollsLeft = game.player.upgradeRerolls;

        const buttons = [];
        let selectedIndex = 0;

        upgradeTitle.textContent = wasBossWave ? 'Boss Defeated!' : 'Wave Cleared!';

        const handleMenuKeydown = (e) => {
            if (game.gameState !== 'UPGRADE' || buttons.length === 0) return;

            if (['ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : buttons.length - 1;
                buttons[selectedIndex].focus();
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex < buttons.length - 1) ? selectedIndex + 1 : 0;
                buttons[selectedIndex].focus();
            } else if (['Enter', 'Space'].includes(e.code)) {
                e.preventDefault();
                buttons[selectedIndex].click();
            }
        };

        const closeMenu = () => {
            upgradeMenu.classList.add('hidden');
            window.removeEventListener('keydown', handleMenuKeydown);
            game.player.upgradeRerolls = rerollsLeft;
            window.focus();
            game.startNextWave();
        };

        const renderOptions = () => {
            upgradeOptions.innerHTML = '';
            buttons.length = 0;
            selectedIndex = 0;

            if (rerollsLeft > 0) {
                const rerollBtn = document.createElement('button');
                rerollBtn.className = 'upgrade-btn';
                rerollBtn.style.setProperty('--rarity-color', '#95a5a6');
                rerollBtn.innerHTML = `<strong>Reroll</strong>Refresh choices (${rerollsLeft} left)`;
                rerollBtn.onclick = () => {
                    rerollsLeft--;
                    renderOptions();
                };
                buttons.push(rerollBtn);
                upgradeOptions.appendChild(rerollBtn);
            }

            const upgrades = UpgradeManager.getRandomUpgrades(optionCount, { wasBossWave });
            upgrades.forEach((upgrade, index) => {
                const btn = document.createElement('button');
                btn.className = 'upgrade-btn';
                btn.style.setProperty('--rarity-color', upgrade.rarity.color);
                btn.innerHTML = `<strong>${upgrade.name}</strong>${upgrade.description}`;
                btn.onclick = () => {
                    game.stats.upgradesPicked++; // Suivi des upgrades
                    upgrade.apply(game.player);
                    closeMenu();
                };
                btn.onmouseenter = () => {
                    selectedIndex = (rerollsLeft > 0 ? index + 1 : index);
                    btn.focus();
                };
                buttons.push(btn);
                upgradeOptions.appendChild(btn);
            });

            if (buttons.length > 0) {
                buttons[0].focus();
            }
        };

        window.addEventListener('keydown', handleMenuKeydown);
        renderOptions();
        hideAllMenus();
        upgradeMenu.classList.remove('hidden');
    });

    window.addEventListener('gameOver', () => {
        // Gros Screen Shake long pour l'impact
        game.applyScreenShake(15, 120); 
        
        gameOverLocked = true; // On bloque les interactions
        updateGameOverStats();
        hideAllMenus();
        gameOverMenu.classList.remove('hidden');
        
        // On attend 7.5 secondes avant de permettre le contrôle au clavier (quand les boutons sont totalement opaques)
        setTimeout(() => {
            gameOverLocked = false;
            gameOverMenuKeyboard.focusFirst();
        }, 7500);
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (game.gameState === 'PLAYING') {
                game.setPaused(true);
                hideAllMenus();
                pauseMenu.classList.remove('hidden');
                pauseMenuKeyboard.focusFirst();
            } else if (game.gameState === 'PAUSED') {
                game.setPaused(false);
                pauseMenu.classList.add('hidden');
                canvas.focus();
            }
        }

        // Suppression de la touche R car on utilise désormais les boutons du menu
    });

    startBtn.addEventListener('click', () => startNewRun(false));
    bossRushBtn.addEventListener('click', () => startNewRun(true));

    resumeBtn.addEventListener('click', () => {
        game.setPaused(false);
        pauseMenu.classList.add('hidden');
    });

    restartBtn.addEventListener('click', () => startNewRun(currentBossRush));
    pauseToMainBtn.addEventListener('click', showMainMenu);

    gameOverRestartBtn.addEventListener('click', () => {
        if (gameOverLocked) return;
        startNewRun(currentBossRush);
    });
    gameOverMainBtn.addEventListener('click', () => {
        if (gameOverLocked) return;
        showMainMenu();
    });

    const mainMenuKeyboard = setupMenuKeyboardNavigation(
        [startBtn, bossRushBtn],
        () => !mainMenu.classList.contains('hidden')
    );

    const pauseMenuKeyboard = setupMenuKeyboardNavigation(
        [resumeBtn, restartBtn, pauseToMainBtn],
        () => !pauseMenu.classList.contains('hidden')
    );

    const gameOverMenuKeyboard = setupMenuKeyboardNavigation(
        [gameOverRestartBtn, gameOverMainBtn],
        () => !gameOverMenu.classList.contains('hidden')
    );

    window.addEventListener('resize', applyCanvasSize);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', applyCanvasSize);
    }

    showMainMenu();

    // Start loop
    animate(performance.now());
});
