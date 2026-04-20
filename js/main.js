window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Create the game instance
    const game = new Game(canvas.width, canvas.height);

    function animate() {
        game.update();
        game.draw(ctx);
        
        requestAnimationFrame(animate);
    }

    // Start loop
    animate();
});
