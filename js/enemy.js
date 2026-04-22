class Enemy {
    static TYPES = {
        GRUNT: {
            key: 'GRUNT',
            label: 'Grunt',
            color: '#f44',
            width: 38,
            height: 38,
            baseHp: [8, 16],
            speed: [1.9, 2.8],
            scoreValue: 1
        },
        TRACKER: {
            key: 'TRACKER',
            label: 'Tracker',
            color: '#e67e22',
            width: 38,
            height: 38,
            baseHp: [10, 18],
            speed: [1.6, 2.3],
            trackingStrength: 1.2,
            scoreValue: 1
        },
        TANK: {
            key: 'TANK',
            label: 'Tank',
            color: '#8e44ad',
            width: 54,
            height: 54,
            baseHp: [24, 38],
            speed: [0.8, 1.4],
            scoreValue: 2
        },
        ZIGZAG: {
            key: 'ZIGZAG',
            label: 'Zigzag',
            color: '#1abc9c',
            width: 34,
            height: 34,
            baseHp: [10, 18],
            speed: [1.6, 2.5],
            zigzagAmplitude: [40, 95],
            zigzagFrequency: [0.03, 0.06],
            scoreValue: 1
        },
        DASHER: {
            key: 'DASHER',
            label: 'Dasher',
            color: '#f1c40f',
            width: 36,
            height: 36,
            baseHp: [9, 17],
            speed: [1.4, 2.2],
            dashCooldown: [90, 140],
            dashSpeed: [5.3, 7],
            scoreValue: 1
        },
        SHOOTER: {
            key: 'SHOOTER',
            label: 'Shooter',
            color: '#3498db',
            width: 40,
            height: 40,
            baseHp: [13, 24],
            speed: [1.1, 1.9],
            shootInterval: [95, 140],
            scoreValue: 2
        },
        SPLITTER: {
            key: 'SPLITTER',
            label: 'Splitter',
            color: '#ff66cc',
            width: 44,
            height: 44,
            baseHp: [18, 28],
            speed: [1.3, 2],
            splitCount: 2,
            scoreValue: 2
        },
        HEALER: {
            key: 'HEALER',
            label: 'Healer',
            color: '#2ecc71',
            width: 42,
            height: 42,
            baseHp: [14, 22],
            speed: [1.1, 1.7],
            pulseInterval: [150, 210],
            healAmount: [2, 5],
            scoreValue: 2
        }
    };

    constructor(game, x, y, hp, isTracking = false, typeKey = null) {
        this.game = game;
        this.x = x;
        this.y = y;

        const fallbackType = isTracking ? Enemy.TYPES.TRACKER : Enemy.TYPES.GRUNT;
        this.type = Enemy.TYPES[typeKey] || fallbackType;

        this.width = this.type.width;
        this.height = this.type.height;
        this.speed = this.randomInRange(this.type.speed);

        this.hp = hp;
        this.maxHp = hp;
        this.markedForDeletion = false;
        this.slowMultiplier = 1;
        this.slowTimer = 0;
        this.hitFlashTimer = 0;
        this.color = this.type.color;

        this.baseX = x;
        this.phase = Math.random() * Math.PI * 2;
        this.zigzagAmplitude = this.randomInRange(this.type.zigzagAmplitude || [0, 0]);
        this.zigzagFrequency = this.randomInRange(this.type.zigzagFrequency || [0, 0]);
        this.patternTimer = 0;
        this.actionTimer = 0;
        this.dashCooldown = this.randomInRange(this.type.dashCooldown || [120, 160]);
        this.dashDuration = 0;
        this.dashVX = 0;
        this.shootInterval = this.randomInRange(this.type.shootInterval || [120, 180]);
        this.pulseInterval = this.randomInRange(this.type.pulseInterval || [180, 220]);
    }

    randomInRange(range) {
        if (!range) return 0;
        const [min, max] = range;
        return min + Math.random() * (max - min);
    }

    update() {
        if (this.slowTimer > 0) {
            this.slowTimer--;
            if (this.slowTimer <= 0) {
                this.slowMultiplier = 1;
            }
        }

        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer--;
        }

        this.patternTimer++;
        this.actionTimer++;

        this.y += this.speed * this.slowMultiplier;

        switch (this.type.key) {
            case 'TRACKER':
                this.applyTracking();
                break;
            case 'ZIGZAG':
                this.applyZigzag();
                break;
            case 'DASHER':
                this.applyDasher();
                break;
            case 'SHOOTER':
                this.applyShooter();
                break;
            case 'HEALER':
                this.applyHealer();
                break;
            default:
                break;
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;

        if (this.y > this.game.height + 40) {
            this.markedForDeletion = true;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.stats.damageDealt += amount; // Suivi des dégâts
        this.hitFlashTimer = 5;
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            this.game.stats.enemiesKilled++; // Suivi des kills
            this.onDeath();
            this.game.player.registerKill();
        }
    }

    applyTracking() {
        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const enemyCenterX = this.x + this.width / 2;
        const drift = this.type.trackingStrength || 1;
        if (enemyCenterX < playerCenterX - 6) {
            this.x += drift;
        } else if (enemyCenterX > playerCenterX + 6) {
            this.x -= drift;
        }
    }

    applyZigzag() {
        this.x = this.baseX + Math.sin(this.patternTimer * this.zigzagFrequency + this.phase) * this.zigzagAmplitude;
    }

    applyDasher() {
        if (this.dashDuration > 0) {
            this.dashDuration--;
            this.x += this.dashVX * this.slowMultiplier;
            return;
        }

        if (this.actionTimer >= this.dashCooldown) {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            const selfCenterX = this.x + this.width / 2;
            this.dashVX = playerCenterX > selfCenterX ? this.randomInRange(this.type.dashSpeed) : -this.randomInRange(this.type.dashSpeed);
            this.dashDuration = 16;
            this.actionTimer = 0;
            this.dashCooldown = this.randomInRange(this.type.dashCooldown);
        }
    }

    applyShooter() {
        if (this.actionTimer >= this.shootInterval) {
            this.actionTimer = 0;
            this.shootInterval = this.randomInRange(this.type.shootInterval);

            const originX = this.x + this.width / 2;
            const originY = this.y + this.height;
            const targetX = this.game.player.x + this.game.player.width / 2;
            const targetY = this.game.player.y + this.game.player.height / 2;

            this.game.enemyProjectiles.push(new EnemyProjectile(originX, originY, 5, 4.8, 1, targetX, targetY, { color: '#67b8ff' }));
        }
    }

    applyHealer() {
        if (this.actionTimer >= this.pulseInterval) {
            this.actionTimer = 0;
            this.pulseInterval = this.randomInRange(this.type.pulseInterval);
            const healAmount = Math.round(this.randomInRange(this.type.healAmount));
            const radius = 110;
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            this.game.enemies.forEach(enemy => {
                if (enemy === this || enemy.markedForDeletion || enemy.type.key === 'HEALER') return;

                const ex = enemy.x + enemy.width / 2;
                const ey = enemy.y + enemy.height / 2;
                if (Math.hypot(ex - centerX, ey - centerY) <= radius) {
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
                }
            });
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.hitFlashTimer > 0 ? '#fff' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.type.key === 'HEALER') {
            ctx.strokeStyle = this.hitFlashTimer > 0 ? '#fff' : '#99ffcc';
            ctx.strokeRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        }

        ctx.fillStyle = this.hitFlashTimer > 0 ? '#000' : '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hp, this.x + this.width / 2, this.y + this.height / 2);
    }

    onDeath() {
        if (this.type.key === 'SPLITTER') {
            const splitCount = this.type.splitCount || 2;
            for (let i = 0; i < splitCount; i++) {
                const spawnX = Math.max(0, Math.min(this.game.width - 28, this.x + (i - (splitCount - 1) / 2) * 24));
                const spawnY = this.y + 8;
                const hp = Math.max(4, Math.floor(this.maxHp * 0.35));
                const child = new Enemy(this.game, spawnX, spawnY, hp, false, 'GRUNT');
                child.width = 28;
                child.height = 28;
                child.speed = 2.6 + Math.random() * 1.2;
                child.color = '#ff99dd';
                this.game.enemies.push(child);
            }
        }
    }

    applySlow(amount, duration) {
        this.slowMultiplier = Math.max(0.35, 1 - amount);
        this.slowTimer = Math.max(this.slowTimer, duration);
    }
}
