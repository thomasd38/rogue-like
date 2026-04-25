class Boss {
    static TYPES = [
        {
            key: 'SIEGE_CORE',
            label: 'Siege Core',
            color: '#9b59b6',
            width: 200,
            height: 100,
            hpBase: 420,
            hpScale: 185,
            moveSpeed: 2.1,
            laser: true,
            laserWidth: 42,
            projectileInterval: 110,
            spawnInterval: 85
        },
        {
            key: 'TWIN_HYDRA',
            label: 'Twin Hydra',
            color: '#16a085',
            width: 220,
            height: 96,
            hpBase: 500,
            hpScale: 210,
            moveSpeed: 2.6,
            spreadShots: true,
            spreadInterval: 88,
            spawnInterval: 92,
            summonTypes: ['DASHER', 'TRACKER']
        },
        {
            key: 'WAR_FORGE',
            label: 'War Forge',
            color: '#d35400',
            width: 230,
            height: 110,
            hpBase: 640,
            hpScale: 230,
            moveSpeed: 1.7,
            projectileInterval: 80,
            spawnInterval: 60,
            summonTypes: ['TANK', 'SHOOTER', 'HEALER']
        },
        {
            key: 'VOID_PRISM',
            label: 'Void Prism',
            color: '#2c3e50',
            width: 190,
            height: 120,
            hpBase: 560,
            hpScale: 250,
            moveSpeed: 2.9,
            radialBursts: true,
            burstInterval: 125,
            teleportInterval: 280,
            spawnInterval: 100,
            summonTypes: ['SPLITTER', 'ZIGZAG']
        }
    ];

    constructor(game, wave) {
        this.game = game;
        this.wave = wave;

        this.type = Boss.TYPES[Math.floor(Math.random() * Boss.TYPES.length)];
        this.width = this.type.width;
        this.height = this.type.height;
        this.x = (this.game.width - this.width) / 2;
        this.y = 50;

        this.maxHp = this.type.hpBase + (wave * this.type.hpScale);
        this.hp = this.maxHp;
        this.hitFlashTimer = 0;
        this.color = this.type.color;

        this.speedX = this.type.moveSpeed;
        this.direction = Math.random() < 0.5 ? 1 : -1;

        this.laserState = 'IDLE';
        this.laserTimer = 0;
        this.laserDurationWarning = 55;
        this.laserDurationFiring = 34;
        this.laserCooldown = 220 + Math.random() * 90;

        this.projectileTimer = 0;
        this.projectileInterval = this.type.projectileInterval || 120;

        this.spawnTimer = 0;
        this.spawnInterval = this.type.spawnInterval || 92;

        this.spreadTimer = 0;
        this.radialTimer = 0;
        this.teleportTimer = 0;
    }

    update() {
        this.handleMovement();
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;

        if (this.type.laser) {
            this.handleLaser();
        }

        this.projectileTimer++;
        if (this.projectileTimer >= this.projectileInterval) {
            this.shootProjectile();
            this.projectileTimer = 0;
        }

        if (this.type.spreadShots) {
            this.spreadTimer++;
            if (this.spreadTimer >= this.type.spreadInterval) {
                this.fireSpread();
                this.spreadTimer = 0;
            }
        }

        if (this.type.radialBursts) {
            this.radialTimer++;
            if (this.radialTimer >= this.type.burstInterval) {
                this.fireRadialBurst();
                this.radialTimer = 0;
            }

            this.teleportTimer++;
            if (this.teleportTimer >= this.type.teleportInterval) {
                this.teleport();
                this.teleportTimer = 0;
            }
        }

        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnMinion();
            this.spawnTimer = 0;
        }
    }

    handleMovement() {
        this.x += this.speedX * this.direction;
        if (this.x <= 0 || this.x + this.width >= this.game.width) {
            this.direction *= -1;
        }
    }

    handleLaser() {
        if (this.laserState === 'IDLE') {
            this.laserTimer++;
            if (this.laserTimer >= this.laserCooldown) {
                this.laserState = 'WARNING';
                this.laserTimer = 0;
            }
        } else if (this.laserState === 'WARNING') {
            this.laserTimer++;
            if (this.laserTimer >= this.laserDurationWarning) {
                this.laserState = 'FIRING';
                this.laserTimer = 0;
            }
        } else if (this.laserState === 'FIRING') {
            this.checkLaserCollision(); // Vérifie les dégâts à CHAQUE frame de tir
            this.laserTimer++;
            if (this.laserTimer >= this.laserDurationFiring) {
                this.laserState = 'IDLE';
                this.laserTimer = 0;
                this.laserCooldown = 210 + Math.random() * 100;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.hitFlashTimer > 0 ? '#fff' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        const hpPercentage = this.hp / this.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 18, this.width, 10);
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y - 18, this.width * hpPercentage, 10);

        ctx.fillStyle = '#fff';
        ctx.font = '15px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.label, this.x + this.width / 2, this.y + 24);
        ctx.fillText(this.hp, this.x + this.width / 2, this.y + this.height / 2 + 12);

        if (this.type.laser) {
            const beamWidth = this.type.laserWidth || 40;
            if (this.laserState === 'WARNING') {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(this.x + this.width / 2 - beamWidth / 2, this.y + this.height, beamWidth, this.game.height);
            } else if (this.laserState === 'FIRING') {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.85)';
                ctx.fillRect(this.x + this.width / 2 - beamWidth / 2, this.y + this.height, beamWidth, this.game.height);
            }
        }

        // Debug Hitbox
        if (this.game.player.debug) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.stats.damageDealt += amount; // Suivi des dégâts
        this.hitFlashTimer = 5;
    }

    shootProjectile() {
        const pX = this.x + this.width / 2;
        const pY = this.y + this.height;
        const targetX = this.game.player.x + this.game.player.width / 2;
        const targetY = this.game.player.y + this.game.player.height / 2;
        this.game.enemyProjectiles.push(new EnemyProjectile(pX, pY, 8, 6, 1, targetX, targetY));
    }

    fireSpread() {
        const originX = this.x + this.width / 2;
        const originY = this.y + this.height;
        const playerX = this.game.player.x + this.game.player.width / 2;
        const playerY = this.game.player.y + this.game.player.height / 2;
        const baseAngle = Math.atan2(playerY - originY, playerX - originX);

        [-0.5, -0.25, 0, 0.25, 0.5].forEach(offset => {
            this.game.enemyProjectiles.push(
                EnemyProjectile.fromAngle(originX, originY, 6, 5.4, 1, baseAngle + offset, { color: '#62ffd8' })
            );
        });
    }

    fireRadialBurst() {
        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;
        const bullets = 14;
        for (let i = 0; i < bullets; i++) {
            const angle = (Math.PI * 2 * i) / bullets;
            this.game.enemyProjectiles.push(
                EnemyProjectile.fromAngle(originX, originY, 5, 4.5, 1, angle, { color: '#a9b0ff' })
            );
        }
    }

    teleport() {
        const margin = 16;
        this.x = margin + Math.random() * (this.game.width - this.width - margin * 2);
        this.direction = Math.random() < 0.5 ? 1 : -1;
    }

    checkLaserCollision() {
        const beamWidth = this.type.laserWidth || 40;
        const laserLeft = this.x + this.width / 2 - beamWidth / 2;
        const laserRight = this.x + this.width / 2 + beamWidth / 2;
        const hitboxes = this.game.player.getHitboxes();
        const hitByLaser = hitboxes.some(pHit => {
            const playerLeft = pHit.x;
            const playerRight = pHit.x + pHit.width;
            return playerRight > laserLeft && playerLeft < laserRight;
        });

        if (hitByLaser) {
            this.game.player.takeDamage(2); // Dégâts importants
        }
    }

    spawnMinion() {
        const minionX = this.x + (Math.random() * Math.max(1, this.width - 40));
        const minionY = this.y + this.height + 4;

        const available = this.type.summonTypes || ['GRUNT', 'TRACKER', 'SHOOTER'];
        const typeKey = available[Math.floor(Math.random() * available.length)];
        const template = Enemy.TYPES[typeKey];
        const hp = Math.round((template.baseHp[0] + Math.random() * (template.baseHp[1] - template.baseHp[0])) * (1 + this.wave * 0.07));

        const minion = new Enemy(this.game, minionX, minionY, hp, false, typeKey);
        this.game.enemies.push(minion);
    }
}
