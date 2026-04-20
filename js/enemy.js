class Enemy {
    constructor(game, x, y, hp) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 1 + Math.random(); // Falling speed
        this.hp = hp;
        this.maxHp = hp;
        this.color = '#f44'; // Red block
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;

        // Remove if it goes off screen
        if (this.y > this.game.height) {
            this.markedForDeletion = true;
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
