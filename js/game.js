class Game {
    constructor(canvasWidth, canvasHeight, canvasElement = null) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.input = new InputHandler(canvasElement);
        this.bossRush = false;
        this.reset();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        if (this.player) {
            const maxX = Math.max(0, this.width - this.player.width);
            this.player.x = Math.max(0, Math.min(this.player.x, maxX));
            // On ne force plus la position Y pour permettre le mouvement vertical libre
        }
    }

    reset(options = {}) {
        this.bossRush = options.bossRush ?? this.bossRush ?? false;
        this.player = new Player(this);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.vfx = []; // Effets visuels (explosions, etc.)
        this.enemyTimer = 0;
        this.baseEnemyInterval = 60;
        this.enemyInterval = this.baseEnemyInterval;

        // Screen Shake
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Wave state
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, UPGRADE, GAMEOVER, WAVE_CLEAR_DELAY
        this.wave = 1;
        this.isBossWave = false;
        this.boss = null;
        this.waveClearDelayFrames = 60;
        this.waveClearTimer = 0;
        this.waveClearPayload = null;

        // Stats tracking
        this.stats = {
            damageDealt: 0,
            damageTaken: 0,
            enemiesKilled: 0,
            bossesDefeated: 0,
            wavesCleared: 0,
            projectilesFired: 0,
            projectilesHit: 0,
            timePlayed: 0, // en frames
            upgradesPicked: 0,
            criticalHits: 0
        };

        // Time based wave
        this.waveDuration = this.bossRush ? 3 * 60 : 30 * 60;
        this.waveTimeLeft = this.waveDuration;
        this.waveElapsedTime = 0;
    }

    applyScreenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
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

        // Update stats
        this.stats.timePlayed++;

        // Update screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
        }

        this.player.update(this.input);

        // Update projectiles
        this.projectiles.forEach(p => p.update());
        this.enemyProjectiles.forEach(p => p.update());

        // Update VFX
        this.vfx.forEach(v => v.update());
        this.vfx = this.vfx.filter(v => !v.markedForDeletion);

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
                this.stats.bossesDefeated++; // Boss vaincu !
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
        ctx.save();
        
        // Apply screen shake
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(dx, dy);
        }

        // Clear canvas
        ctx.clearRect(-100, -100, this.width + 200, this.height + 200);

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

            if (this.bossRush) {
                ctx.fillStyle = '#ffd54a';
                ctx.fillText('BOSS RUSH', this.width - 10, 55);
            }
        }

        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemyProjectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        if (this.boss) this.boss.draw(ctx);
        this.vfx.forEach(v => v.draw(ctx));

        ctx.restore();
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
                if (projectile.markedForDeletion || projectile.hitBoss) return;
                let closestX = Math.max(this.boss.x, Math.min(projectile.x, this.boss.x + this.boss.width));
                let closestY = Math.max(this.boss.y, Math.min(projectile.y, this.boss.y + this.boss.height));
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
                if (distanceSquared < (projectile.radius * projectile.radius)) {
                    projectile.hitBoss = true;
                    this.stats.projectilesHit++; // Hit boss
                    this.boss.takeDamage(projectile.damage);
                    this.handleProjectileAfterHit(projectile);
                    if (projectile.explosiveRadius > 0) {
                        this.triggerExplosion(projectile.x, projectile.y, projectile.explosiveRadius, projectile.damage, true);
                    }
                }
            });

            // Player vs Boss
            const hitboxes = this.player.getHitboxes();
            const hitByBoss = hitboxes.some(pHit => 
                pHit.x < this.boss.x + this.boss.width &&
                pHit.x + pHit.width > this.boss.x &&
                pHit.y < this.boss.y + this.boss.height &&
                pHit.y + pHit.height > this.boss.y
            );

            if (hitByBoss) {

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
                    this.stats.projectilesHit++; // Hit enemy
                    enemy.takeDamage(projectile.damage);
                    if (projectile.slowAmount > 0) {
                        enemy.applySlow(projectile.slowAmount, projectile.slowDuration);
                    }
                    if (projectile.explosiveRadius > 0) {
                        this.triggerExplosion(projectile.x, projectile.y, projectile.explosiveRadius, projectile.damage, false, enemy);
                    }
                    this.handleProjectileAfterHit(projectile);
                }
            });
        });

        // Enemy Projectiles vs Player
        const hitboxes = this.player.getHitboxes();
        this.enemyProjectiles.forEach(projectile => {
            if (projectile.markedForDeletion) return;
            
            const hitPlayer = hitboxes.some(pHit => {
                let closestX = Math.max(pHit.x, Math.min(projectile.x, pHit.x + pHit.width));
                let closestY = Math.max(pHit.y, Math.min(projectile.y, pHit.y + pHit.height));
                let distanceX = projectile.x - closestX;
                let distanceY = projectile.y - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
                return distanceSquared < (projectile.radius * projectile.radius);
            });

            if (hitPlayer) {
                projectile.markedForDeletion = true;
                this.player.takeDamage(projectile.damage);
                if (this.player.hp <= 0) {
                    this.setGameOver();
                }
            }
        });

        // Player vs Enemies
        this.enemies.forEach(enemy => {
            if (enemy.markedForDeletion) return;
            
            // AABB collision avec les hitboxes composites
            const hitEnemy = hitboxes.some(pHit => 
                pHit.x < enemy.x + enemy.width &&
                pHit.x + pHit.width > enemy.x &&
                pHit.y < enemy.y + enemy.height &&
                pHit.y + pHit.height > enemy.y
            );

            if (hitEnemy) {

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
        // Effet visuel
        this.vfx.push(new ExplosionEffect(this, x, y, radius));
        
        // Screen Shake
        this.applyScreenShake(radius / 10, 15);

        this.enemies.forEach(enemy => {
            if (ignoreEnemy && enemy === ignoreEnemy) return;
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distance = Math.hypot(enemyCenterX - x, enemyCenterY - y);
            if (distance <= radius) {
                const ratio = Math.max(0, 1 - distance / radius);
                const damage = Math.max(1, Math.round(sourceDamage * (0.4 + ratio * 0.6)));
                enemy.takeDamage(damage);
            }
        });

        if (includeBoss && this.boss) {
            const closestX = Math.max(this.boss.x, Math.min(x, this.boss.x + this.boss.width));
            const closestY = Math.max(this.boss.y, Math.min(y, this.boss.y + this.boss.height));
            const distance = Math.hypot(x - closestX, y - closestY);
            if (distance <= radius) {
                const ratio = Math.max(0, 1 - distance / radius);
                const damage = Math.max(1, Math.round(sourceDamage * (0.35 + ratio * 0.45)));
                this.boss.takeDamage(damage);
            }
        }
    }

    startNextWave() {
        this.stats.wavesCleared++; // Vague terminée !
        this.wave++;
        this.isBossWave = (this.wave % 5 === 0);

        if (this.isBossWave) {
            this.boss = new Boss(this, this.wave);
        } else {
            this.waveDuration = this.bossRush ? 3 * 60 : 30 * 60;
            this.waveTimeLeft = this.waveDuration;
            this.waveElapsedTime = 0;
            this.baseEnemyInterval = Math.max(20, this.baseEnemyInterval - 5);
            this.enemyInterval = this.baseEnemyInterval;
        }

        this.gameState = 'PLAYING';
    }
}

class ExplosionEffect {
    constructor(game, x, y, maxRadius) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 0;
        this.life = 1.0;
        this.decay = 0.05; // Dure environ 20 frames
        this.markedForDeletion = false;
    }

    update() {
        this.life -= this.decay;
        this.radius = this.maxRadius * (1 - this.life);
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 100, 0, ${this.life})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 50, ${this.life * 0.5})`;
        ctx.fill();
        ctx.restore();
    }
}
