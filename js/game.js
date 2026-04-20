class Game {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.input = new InputHandler();
        this.player = new Player(this);
        this.projectiles = [];
    }

    update() {
        this.player.update(this.input);

        // Update projectiles
        this.projectiles.forEach(p => p.update());
        
        // Remove off-screen projectiles
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    draw(ctx) {
        // Clear canvas (though main.js could do it, better to let game manage its own drawing if we want backgrounds)
        ctx.clearRect(0, 0, this.width, this.height);

        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
    }
}
