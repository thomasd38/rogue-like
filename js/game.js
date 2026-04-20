class Game {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.input = new InputHandler();
        this.player = new Player(this);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.enemyTimer = 0;
        this.baseEnemyInterval = 60;
        this.enemyInterval = this.baseEnemyInterval;

        // Wave state
        this.gameState = 'PLAYING'; // PLAYING, UPGRADE, GAMEOVER
        this.wave = 1;
        this.isBossWave = false;
        this.boss = null;

        // Time based wave
        this.waveDuration = 30 * 60; // 60 seconds at 60fps
        this.waveTimeLeft = this.waveDuration;
        this.waveElapsedTime = 0;
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.player.update(this.input);

        // Update projectiles
        this.projectiles.forEach(p => p.update());
        this.enemyProjectiles.forEach(p => p.update());

        if (this.isBossWave) {
            this.boss.update();
            this.enemies.forEach(e => e.update());
            this.checkCollisions();

            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion);
            this.enemies = this.enemies.filter(e => !e.markedForDeletion);

            if (this.boss.hp <= 0) {
                this.gameState = 'UPGRADE';
                this.boss = null;
                this.enemies = [];
                this.enemyProjectiles = [];
                window.dispatchEvent(new Event('waveCleared'));
            }
        } else {
            // Update wave timers
            this.waveTimeLeft--;
            this.waveElapsedTime++;

            // Increase difficulty every 10 seconds (600 frames)
            if (this.waveElapsedTime % 600 === 0) {
                if (this.enemyInterval > 10) {
                    this.enemyInterval -= 5;
                }
            }

            // Spawning enemies endlessly
            this.enemyTimer++;
            if (this.enemyTimer > this.enemyInterval) {
                this.spawnEnemy();
                this.enemyTimer = 0;
            }

            // Update enemies
            this.enemies.forEach(e => e.update());

            this.checkCollisions();

            // Remove off-screen or dead entities
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion);
            this.enemies = this.enemies.filter(e => !e.markedForDeletion);

            // Check for wave clear
            if (this.waveTimeLeft <= 0) {
                this.gameState = 'UPGRADE';
                // Clear all enemies for next wave
                this.enemies = [];
                this.enemyProjectiles = [];
                window.dispatchEvent(new Event('waveCleared'));
            }
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

            if (this.isBossWave) {
                ctx.fillStyle = '#f0f';
                ctx.font = '16px monospace';
                ctx.fillText(`BOSS WAVE`, this.width - 10, 35);
            } else {
                ctx.font = '14px monospace';
                const secondsLeft = Math.ceil(this.waveTimeLeft / 60);
                ctx.fillText(`Time Left: ${secondsLeft}s`, this.width - 10, 35);
            }
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
        this.enemyProjectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        if (this.boss) this.boss.draw(ctx);
    }

    spawnEnemy() {
        const x = Math.random() * (this.width - 40);
        const y = -40; // Just above screen
        const hp = 10 + Math.floor(Math.random() * 20); // random HP 10-30
        const isTracking = Math.random() < 0.3; // 30% chance to be a tracking enemy
        this.enemies.push(new Enemy(this, x, y, hp, isTracking));
    }

    checkCollisions() {
        if (this.boss) {
            // Projectiles vs Boss
            this.projectiles.forEach(projectile => {
                let closestX = Math.max(this.boss.x, Math.min(projectile.x, this.boss.x + this.boss.width));
                let closestY = Math.max(this.boss.y, Math.min(projectile.y, this.boss.y + this.boss.height));
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
                if (distanceSquared < (projectile.radius * projectile.radius)) {
                    projectile.markedForDeletion = true;
                    this.boss.hp -= projectile.damage;
                }
            });

            // Player vs Boss
            if (this.player.x < this.boss.x + this.boss.width &&
                this.player.x + this.player.width > this.boss.x &&
                this.player.y < this.boss.y + this.boss.height &&
                this.player.y + this.player.height > this.boss.y) {

                this.player.hp -= 3;
                if (this.player.hp <= 0) {
                    this.gameState = 'GAMEOVER';
                }
            }
        }

        // Projectiles vs Enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                // Simple circle vs AABB (rectangle) collision
                let closestX = Math.max(enemy.x, Math.min(projectile.x, enemy.x + enemy.width));
                let closestY = Math.max(enemy.y, Math.min(projectile.y, enemy.y + enemy.height));
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;
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

        // Enemy Projectiles vs Player
        this.enemyProjectiles.forEach(projectile => {
            let closestX = Math.max(this.player.x, Math.min(projectile.x, this.player.x + this.player.width));
            let closestY = Math.max(this.player.y, Math.min(projectile.y, this.player.y + this.player.height));
            let distanceX = projectile.x - closestX;
            let distanceY = projectile.y - closestY;
            let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
            
            if (distanceSquared < (projectile.radius * projectile.radius)) {
                projectile.markedForDeletion = true;
                this.player.hp -= projectile.damage;
                if (this.player.hp <= 0) {
                    this.gameState = 'GAMEOVER';
                }
            }
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
        this.isBossWave = (this.wave % 5 === 0);

        if (this.isBossWave) {
            this.boss = new Boss(this, this.wave);
        } else {
            this.waveTimeLeft = this.waveDuration;
            this.waveElapsedTime = 0;
            this.baseEnemyInterval = Math.max(20, this.baseEnemyInterval - 5);
            this.enemyInterval = this.baseEnemyInterval;
        }

        this.gameState = 'PLAYING';
    }
}
