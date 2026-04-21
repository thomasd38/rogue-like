class Game {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.input = new InputHandler();
        this.fastPlay = false;
        this.reset();
    }

    reset(options = {}) {
        this.fastPlay = options.fastPlay ?? this.fastPlay ?? false;
        this.player = new Player(this);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.enemyTimer = 0;
        this.baseEnemyInterval = 60;
        this.enemyInterval = this.baseEnemyInterval;

        // Wave state
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, UPGRADE, GAMEOVER, WAVE_CLEAR_DELAY
        this.wave = 1;
        this.isBossWave = false;
        this.boss = null;
        this.waveClearDelayFrames = 60;
        this.waveClearTimer = 0;
        this.waveClearPayload = null;

        // Time based wave
        this.waveDuration = this.fastPlay ? 3 * 60 : 30 * 60;
        this.waveTimeLeft = this.waveDuration;
        this.waveElapsedTime = 0;
    }

    startGame(options = {}) {
        this.reset(options);
        this.gameState = 'PLAYING';
    }

    setPaused(isPaused) {
        if (isPaused && this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
        } else if (!isPaused && this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
        }
    }

    setGameOver() {
        if (this.gameState === 'GAMEOVER') return;
        this.gameState = 'GAMEOVER';
        window.dispatchEvent(new Event('gameOver'));
    }

    update() {
        if (this.gameState === 'WAVE_CLEAR_DELAY') {
            this.waveClearTimer--;
            if (this.waveClearTimer <= 0 && this.waveClearPayload) {
                const payload = this.waveClearPayload;
                this.waveClearPayload = null;

                if (payload.shouldOpenRewardMenu) {
                    this.gameState = 'UPGRADE';
                }

                window.dispatchEvent(new CustomEvent('waveCleared', {
                    detail: payload
                }));

                if (!payload.shouldOpenRewardMenu) {
                    this.startNextWave();
                }
            }
            return;
        }

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
                this.boss = null;
                this.enemyProjectiles = [];
                this.beginWaveClearSequence({
                    wasBossWave: true,
                    shouldOpenRewardMenu: true
                });
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
                this.enemyProjectiles = [];
                this.beginWaveClearSequence({
                    wasBossWave: false,
                    shouldOpenRewardMenu: true
                });
            }
        }
    }

    draw(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw wave text if playing
        if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED' || this.gameState === 'UPGRADE') {
            ctx.fillStyle = '#fff';
            ctx.font = '20px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`Wave: ${this.wave}`, this.width - 10, 10);

            if (this.isBossWave) {
                ctx.fillStyle = '#f0f';
                ctx.font = '16px monospace';
                const bossName = this.boss ? this.boss.type.label : 'BOSS';
                ctx.fillText(`BOSS: ${bossName}`, this.width - 10, 35);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '14px monospace';
                const secondsLeft = Math.ceil(this.waveTimeLeft / 60);
                ctx.fillText(`Time Left: ${secondsLeft}s`, this.width - 10, 35);
            }

            if (this.fastPlay) {
                ctx.fillStyle = '#ffd54a';
                ctx.fillText('FAST PLAY', this.width - 10, 55);
            }
        }

        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemyProjectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        if (this.boss) this.boss.draw(ctx);
    }

    spawnEnemy() {
        const progression = Math.min(1, (this.wave - 1) / 14);

        const weightedTypes = [
            { key: 'GRUNT', weight: 30 },
            { key: 'TRACKER', weight: 14 + this.wave },
            { key: 'ZIGZAG', weight: this.wave >= 2 ? 12 + this.wave : 0 },
            { key: 'DASHER', weight: this.wave >= 3 ? 10 + this.wave : 0 },
            { key: 'SHOOTER', weight: this.wave >= 4 ? 10 + this.wave : 0 },
            { key: 'TANK', weight: this.wave >= 5 ? 8 + this.wave : 0 },
            { key: 'SPLITTER', weight: this.wave >= 6 ? 7 + this.wave : 0 },
            { key: 'HEALER', weight: this.wave >= 7 ? 6 + this.wave : 0 }
        ].filter(entry => entry.weight > 0);

        const totalWeight = weightedTypes.reduce((sum, type) => sum + type.weight, 0);
        let roll = Math.random() * totalWeight;
        let selectedType = weightedTypes[0].key;

        for (const option of weightedTypes) {
            roll -= option.weight;
            if (roll <= 0) {
                selectedType = option.key;
                break;
            }
        }

        const template = Enemy.TYPES[selectedType];
        const x = Math.random() * (this.width - template.width);
        const y = -template.height - Math.random() * 40;
        const baseHp = template.baseHp[0] + Math.random() * (template.baseHp[1] - template.baseHp[0]);
        const hp = Math.round(baseHp * (1 + progression * 1.2));

        this.enemies.push(new Enemy(this, x, y, hp, selectedType === 'TRACKER', selectedType));
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
                    this.boss.hp -= projectile.damage;
                    this.handleProjectileAfterHit(projectile);
                    if (projectile.explosiveRadius > 0) {
                        this.triggerExplosion(projectile.x, projectile.y, projectile.explosiveRadius, projectile.damage, true);
                    }
                }
            });

            // Player vs Boss
            if (this.player.x < this.boss.x + this.boss.width &&
                this.player.x + this.player.width > this.boss.x &&
                this.player.y < this.boss.y + this.boss.height &&
                this.player.y + this.player.height > this.boss.y) {

                this.player.takeDamage(3);
                if (this.player.hp <= 0) {
                    this.setGameOver();
                }
            }
        }

        // Projectiles vs Enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (projectile.markedForDeletion || projectile.hitEnemies.has(enemy)) return;
                // Simple circle vs AABB (rectangle) collision
                let closestX = Math.max(enemy.x, Math.min(projectile.x, enemy.x + enemy.width));
                let closestY = Math.max(enemy.y, Math.min(projectile.y, enemy.y + enemy.height));
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
                if (distanceSquared < (projectile.radius * projectile.radius)) {
                    projectile.hitEnemies.add(enemy);
                    enemy.hp -= projectile.damage;
                    if (projectile.slowAmount > 0) {
                        enemy.applySlow(projectile.slowAmount, projectile.slowDuration);
                    }
                    if (projectile.explosiveRadius > 0) {
                        this.triggerExplosion(projectile.x, projectile.y, projectile.explosiveRadius, projectile.damage, false, enemy);
                    }
                    this.handleProjectileAfterHit(projectile);
                    if (enemy.hp <= 0) {
                        enemy.markedForDeletion = true;
                        enemy.onDeath();
                        this.player.registerKill();
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
                this.player.takeDamage(projectile.damage);
                if (this.player.hp <= 0) {
                    this.setGameOver();
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
                this.player.takeDamage(1);

                if (this.player.hp <= 0) {
                    this.setGameOver();
                }
            }
        });
    }

    eliminateAllEnemies() {
        this.enemies.forEach(enemy => {
            if (enemy.markedForDeletion) return;
            enemy.markedForDeletion = true;
            enemy.onDeath();
            this.player.registerKill();
        });
        this.enemies = [];
    }

    beginWaveClearSequence(payload) {
        this.eliminateAllEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.gameState = 'WAVE_CLEAR_DELAY';
        this.waveClearPayload = payload;
        this.waveClearTimer = this.waveClearDelayFrames;
    }

    handleProjectileAfterHit(projectile) {
        if (projectile.pierceRemaining > 0) {
            projectile.pierceRemaining--;
        } else {
            projectile.markedForDeletion = true;
        }
    }

    triggerExplosion(x, y, radius, sourceDamage, includeBoss = false, ignoreEnemy = null) {
        this.enemies.forEach(enemy => {
            if (ignoreEnemy && enemy === ignoreEnemy) return;
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distance = Math.hypot(enemyCenterX - x, enemyCenterY - y);
            if (distance <= radius) {
                const ratio = Math.max(0, 1 - distance / radius);
                const damage = Math.max(1, Math.round(sourceDamage * (0.4 + ratio * 0.6)));
                enemy.hp -= damage;
                if (enemy.hp <= 0) {
                    enemy.markedForDeletion = true;
                    enemy.onDeath();
                    this.player.registerKill();
                }
            }
        });

        if (includeBoss && this.boss) {
            const closestX = Math.max(this.boss.x, Math.min(x, this.boss.x + this.boss.width));
            const closestY = Math.max(this.boss.y, Math.min(y, this.boss.y + this.boss.height));
            const distance = Math.hypot(x - closestX, y - closestY);
            if (distance <= radius) {
                const ratio = Math.max(0, 1 - distance / radius);
                const damage = Math.max(1, Math.round(sourceDamage * (0.35 + ratio * 0.45)));
                this.boss.hp -= damage;
            }
        }
    }

    startNextWave() {
        this.wave++;
        this.isBossWave = (this.wave % 5 === 0);

        if (this.isBossWave) {
            this.boss = new Boss(this, this.wave);
        } else {
            this.waveDuration = this.fastPlay ? 3 * 60 : 30 * 60;
            this.waveTimeLeft = this.waveDuration;
            this.waveElapsedTime = 0;
            this.baseEnemyInterval = Math.max(20, this.baseEnemyInterval - 5);
            this.enemyInterval = this.baseEnemyInterval;
        }

        this.gameState = 'PLAYING';
    }
}
