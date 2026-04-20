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
        
        // Clear old buttons
        upgradeOptions.innerHTML = ''; 

        // Get 3 random upgrades
        const upgrades = UpgradeManager.getRandomUpgrades(3);
        const buttons = [];
        
        let selectedIndex = 0;
        
        const handleMenuKeydown = (e) => {
            if (game.gameState !== 'UPGRADE') return;
            
            // W, Z, ArrowUp
            if (['ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : buttons.length - 1;
                buttons[selectedIndex].focus();
            } 
            // S, ArrowDown
            else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                selectedIndex = (selectedIndex < buttons.length - 1) ? selectedIndex + 1 : 0;
                buttons[selectedIndex].focus();
            } 
            // Enter, Space
            else if (['Enter', 'Space'].includes(e.code)) {
                e.preventDefault();
                buttons[selectedIndex].click();
            }
        };

        window.addEventListener('keydown', handleMenuKeydown);
        
        upgrades.forEach((upgrade, index) => {
            const btn = document.createElement('button');
            btn.className = 'upgrade-btn';
            btn.style.setProperty('--rarity-color', upgrade.rarity.color);
            btn.innerHTML = `<strong>${upgrade.name}</strong>${upgrade.description}`;
            buttons.push(btn);
            
            btn.onclick = () => {
                upgrade.apply(game.player);
                upgradeMenu.classList.add('hidden');
                
                window.removeEventListener('keydown', handleMenuKeydown);
                
                // Ensure focus returns to the body/window so keys work immediately
                window.focus(); 
                
                game.startNextWave();
            };

            // Mouse hover updates selection
            btn.onmouseenter = () => {
                selectedIndex = index;
                btn.focus();
            };
            
            upgradeOptions.appendChild(btn);
        });

        // Show menu
        upgradeMenu.classList.remove('hidden');
        if (buttons.length > 0) {
            buttons[0].focus();
        }
    });

    // Start loop
    animate(performance.now());
});
