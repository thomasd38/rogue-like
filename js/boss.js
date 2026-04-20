class Boss {
    constructor(game, wave) {
        this.game = game;
        this.width = 200;
        this.height = 100;
        this.x = (this.game.width - this.width) / 2;
        this.y = 50;

        // Scale HP based on wave
        this.maxHp = 500 + (wave * 200);
        this.hp = this.maxHp;

        this.color = '#9b59b6'; // Purple

        // Movement
        this.speedX = 2;
        this.direction = 1;

        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = 90; // Spawn an enemy every 1.5 seconds
    }

    update() {
        // Movement: Bounce off walls
        this.x += this.speedX * this.direction;
        if (this.x <= 0 || this.x + this.width >= this.game.width) {
            this.direction *= -1;
        }

        // Spawning enemies
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnMinion();
            this.spawnTimer = 0;
        }
    }

    draw(ctx) {
        // Draw Boss
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw Boss HP Bar
        const hpPercentage = this.hp / this.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 15, this.width, 10);
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y - 15, this.width * hpPercentage, 10);

        // Draw HP Text
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hp, this.x + this.width / 2, this.y + this.height / 2);
    }

    spawnMinion() {
        // Spawn an enemy directly below the boss
        const minionX = this.x + (Math.random() * this.width);
        const minionY = this.y + this.height;
        const minionHp = 10 + Math.floor(Math.random() * 10);

        const minion = new Enemy(this.game, minionX, minionY, minionHp);
        minion.speed = 3 + Math.random(); // slightly faster minions
        this.game.enemies.push(minion);
    }
}
