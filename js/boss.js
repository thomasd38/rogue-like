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

        // Laser state
        this.laserState = 'IDLE'; // IDLE, WARNING, FIRING
        this.laserTimer = 0;
        this.laserDurationWarning = 60; // 1 second warning
        this.laserDurationFiring = 30; // 0.5 second firing
        this.laserCooldown = 300 + Math.random() * 120; // 5-7 seconds

        // Projectile state
        this.projectileTimer = 0;
        this.projectileInterval = 120; // 2 seconds

        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = 90; // Spawn an enemy every 1.5 seconds
    }

    update() {
        if (this.laserState === 'IDLE') {
            // Movement: Bounce off walls
            this.x += this.speedX * this.direction;
            if (this.x <= 0 || this.x + this.width >= this.game.width) {
                this.direction *= -1;
            }

            // Laser logic
            this.laserTimer++;
            if (this.laserTimer >= this.laserCooldown) {
                this.laserState = 'WARNING';
                this.laserTimer = 0;
            }

            // Projectile logic
            this.projectileTimer++;
            if (this.projectileTimer >= this.projectileInterval) {
                this.shootProjectile();
                this.projectileTimer = 0;
            }

            // Spawning enemies
            this.spawnTimer++;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnMinion();
                this.spawnTimer = 0;
            }
        } else if (this.laserState === 'WARNING') {
            this.laserTimer++;
            if (this.laserTimer >= this.laserDurationWarning) {
                this.laserState = 'FIRING';
                this.laserTimer = 0;
                // Deal damage immediately if player is under
                this.checkLaserCollision();
            }
        } else if (this.laserState === 'FIRING') {
            this.laserTimer++;
            if (this.laserTimer >= this.laserDurationFiring) {
                this.laserState = 'IDLE';
                this.laserTimer = 0;
                this.laserCooldown = 300 + Math.random() * 120;
            }
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
        
        // Draw Laser
        if (this.laserState === 'WARNING') {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x + this.width / 2 - 10, this.y + this.height, 20, this.game.height);
        } else if (this.laserState === 'FIRING') {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
            ctx.fillRect(this.x + this.width / 2 - 20, this.y + this.height, 40, this.game.height);
        }
    }

    shootProjectile() {
        const pX = this.x + this.width / 2;
        const pY = this.y + this.height;
        const targetX = this.game.player.x + this.game.player.width / 2;
        const targetY = this.game.player.y + this.game.player.height / 2;
        
        this.game.enemyProjectiles.push(new EnemyProjectile(pX, pY, 8, 6, 1, targetX, targetY));
    }

    checkLaserCollision() {
        const laserLeft = this.x + this.width / 2 - 20;
        const laserRight = this.x + this.width / 2 + 20;
        const playerLeft = this.game.player.x;
        const playerRight = this.game.player.x + this.game.player.width;

        if (playerRight > laserLeft && playerLeft < laserRight) {
            this.game.player.hp -= 2; // massive damage
            if (this.game.player.hp <= 0) {
                this.game.gameState = 'GAMEOVER';
            }
        }
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
