class Game {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.input = new InputHandler();
        this.player = new Player(this);
        this.projectiles = [];
        this.enemies = [];
        this.enemyTimer = 0;
        this.enemyInterval = 60; // Spawn every 60 frames
        
        // Wave state
        this.gameState = 'PLAYING'; // PLAYING, UPGRADE, GAMEOVER
        this.wave = 1;
        this.enemiesToSpawn = 10;
        this.enemiesSpawned = 0;
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.player.update(this.input);

        // Update projectiles
        this.projectiles.forEach(p => p.update());
        
        // Spawning enemies
        if (this.enemiesSpawned < this.enemiesToSpawn) {
            this.enemyTimer++;
            if (this.enemyTimer > this.enemyInterval) {
                this.spawnEnemy();
                this.enemiesSpawned++;
                this.enemyTimer = 0;
            }
        }

        // Update enemies
        this.enemies.forEach(e => e.update());

        this.checkCollisions();

        // Remove off-screen or dead entities
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // Check for wave clear
        if (this.enemiesSpawned >= this.enemiesToSpawn && this.enemies.length === 0) {
            this.gameState = 'UPGRADE';
            window.dispatchEvent(new Event('waveCleared'));
        }
    }

    draw(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw wave text if playing
        if (this.gameState === 'PLAYING') {
            ctx.fillStyle = '#fff';
            ctx.font = '20px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`Wave: ${this.wave}`, this.width - 10, 10);
            ctx.font = '14px monospace';
            ctx.fillText(`Enemies left: ${this.enemiesToSpawn - this.enemiesSpawned + this.enemies.length}`, this.width - 10, 35);
        }

        if (this.gameState === 'GAMEOVER') {
            ctx.fillStyle = '#f00';
            ctx.font = '40px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            ctx.font = '20px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('Refresh to restart', this.width / 2, this.height / 2 + 40);
            return;
        }

        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
    }

    spawnEnemy() {
        const x = Math.random() * (this.width - 40);
        const y = -40; // Just above screen
        const hp = 10 + Math.floor(Math.random() * 20); // random HP 10-30
        this.enemies.push(new Enemy(this, x, y, hp));
    }

    checkCollisions() {
        // Projectiles vs Enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                // Simple circle vs AABB (rectangle) collision
                // Find the closest point to the circle within the rectangle
                let closestX = Math.max(enemy.x, Math.min(projectile.x, enemy.x + enemy.width));
                let closestY = Math.max(enemy.y, Math.min(projectile.y, enemy.y + enemy.height));

                // Calculate the distance between the circle's center and this closest point
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;

                // If the distance is less than the circle's radius, an intersection occurs
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
                if (distanceSquared < (projectile.radius * projectile.radius)) {
                    projectile.markedForDeletion = true;
                    enemy.hp -= projectile.damage;
                    if (enemy.hp <= 0) {
                        enemy.markedForDeletion = true;
                    }
                }
            });
        });

        // Player vs Enemies
        this.enemies.forEach(enemy => {
            // AABB collision
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                enemy.markedForDeletion = true;
                this.player.hp--;
                
                if (this.player.hp <= 0) {
                    this.gameState = 'GAMEOVER';
                }
            }
        });
    }

    startNextWave() {
        this.wave++;
        this.enemiesToSpawn += 5; // Add 5 more enemies per wave
        this.enemiesSpawned = 0;
        this.enemyInterval = Math.max(20, this.enemyInterval - 5); // Spawn enemies faster
        this.gameState = 'PLAYING';
    }
}
