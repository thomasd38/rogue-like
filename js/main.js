window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const mainMenu = document.getElementById('main-menu');
    const pauseMenu = document.getElementById('pause-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const upgradeMenu = document.getElementById('upgrade-menu');
    const upgradeTitle = document.getElementById('upgrade-title');

    const startBtn = document.getElementById('start-btn');
    const fastPlayBtn = document.getElementById('fast-play-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const pauseToMainBtn = document.getElementById('pause-main-btn');
    const gameOverRestartBtn = document.getElementById('gameover-restart-btn');
    const gameOverMainBtn = document.getElementById('gameover-main-btn');

    // Create the game instance
    const game = new Game(canvas.width, canvas.height);

    const fps = 60;
    const interval = 1000 / fps;
    let then = performance.now();

    let currentFastPlay = false;

    const hideAllMenus = () => {
        mainMenu.classList.add('hidden');
        pauseMenu.classList.add('hidden');
        gameOverMenu.classList.add('hidden');
        upgradeMenu.classList.add('hidden');
    };

    const setupMenuKeyboardNavigation = (menuButtons, isMenuActive) => {
        let selectedIndex = 0;

        const focusCurrentButton = () => {
            if (menuButtons.length === 0) return;
            menuButtons[selectedIndex].focus();
        };

        menuButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => {
                selectedIndex = index;
                focusCurrentButton();
            });
        });

        const handleMenuKeydown = (e) => {
            if (!isMenuActive()) return;

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

    const startNewRun = (fastPlayMode) => {
        currentFastPlay = fastPlayMode;
        hideAllMenus();
        game.startGame({ fastPlay: fastPlayMode });
        canvas.focus();
    };

    const showMainMenu = () => {
        game.reset({ fastPlay: false });
        hideAllMenus();
        mainMenu.classList.remove('hidden');
        mainMenuKeyboard.focusFirst();
    };

    function animate(now) {
        requestAnimationFrame(animate);

        const delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

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
                btn.innerHTML = `<strong>${upgrade.name} [${upgrade.rarity.name}]</strong>${upgrade.description}`;
                btn.onclick = () => {
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
        hideAllMenus();
        gameOverMenu.classList.remove('hidden');
        gameOverRestartBtn.focus();
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

        if (game.gameState === 'GAMEOVER' && e.code === 'KeyR') {
            startNewRun(currentFastPlay);
        }
    });

    startBtn.addEventListener('click', () => startNewRun(false));
    fastPlayBtn.addEventListener('click', () => startNewRun(true));

    resumeBtn.addEventListener('click', () => {
        game.setPaused(false);
        pauseMenu.classList.add('hidden');
    });

    restartBtn.addEventListener('click', () => startNewRun(currentFastPlay));
    pauseToMainBtn.addEventListener('click', showMainMenu);

    gameOverRestartBtn.addEventListener('click', () => startNewRun(currentFastPlay));
    gameOverMainBtn.addEventListener('click', showMainMenu);

    const mainMenuKeyboard = setupMenuKeyboardNavigation(
        [startBtn, fastPlayBtn],
        () => !mainMenu.classList.contains('hidden')
    );

    const pauseMenuKeyboard = setupMenuKeyboardNavigation(
        [resumeBtn, restartBtn, pauseToMainBtn],
        () => !pauseMenu.classList.contains('hidden')
    );

    showMainMenu();

    // Start loop
    animate(performance.now());
});
