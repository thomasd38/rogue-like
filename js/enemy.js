class Enemy {
    constructor(game, x, y, hp, isTracking = false) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 2 + Math.random(); // Falling speed
        this.hp = hp;
        this.maxHp = hp;
        this.isTracking = isTracking;
        this.color = this.isTracking ? '#e67e22' : '#f44'; // Orange if tracking, Red if normal
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;

        if (this.isTracking) {
            // Drift towards player horizontally
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            const enemyCenterX = this.x + this.width / 2;
            if (enemyCenterX < playerCenterX - 5) {
                this.x += 1; // Drift right
            } else if (enemyCenterX > playerCenterX + 5) {
                this.x -= 1; // Drift left
            }
        }

        // Wrap around if it goes off screen
        if (this.y > this.game.height) {
            this.y = -this.height;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw HP text
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hp, this.x + this.width / 2, this.y + this.height / 2);
    }
}
