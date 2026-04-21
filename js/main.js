window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Create the game instance
    const game = new Game(canvas.width, canvas.height);

    const fps = 60;
    const interval = 1000 / fps;
    let then = performance.now();

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
    window.addEventListener('waveCleared', () => {
        const upgradeMenu = document.getElementById('upgrade-menu');
        const upgradeOptions = document.getElementById('upgrade-options');
        const optionCount = 3 + game.player.upgradeChoicesBonus;
        let rerollsLeft = game.player.upgradeRerolls;
        
        const buttons = [];
        let selectedIndex = 0;

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

            const upgrades = UpgradeManager.getRandomUpgrades(optionCount);
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

        // Show menu
        upgradeMenu.classList.remove('hidden');
    });

    // Start loop
    animate(performance.now());
});
