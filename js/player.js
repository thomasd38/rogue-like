class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - this.height - 20;
        this.speed = 5;
        this.color = '#0af'; // Cannon color

        // Stats
        this.fireRate = 75; // Frames between shots (lower is faster)
        this.fireTimer = 0;
        this.projectileSpeed = 10;
        this.projectileDamage = 10;
        this.projectileRadius = 5;
        this.projectileCount = 1;
        this.pierce = 0;
        this.critChance = 0;
        this.critMultiplier = 1.5;
        this.explosiveRadius = 0;
        this.explosiveEdgeMultiplier = 0.45;
        this.slowOnHit = 0;
        this.slowDuration = 90;
        this.chargedShotCooldownFrames = 0;
        this.chargedShotDamageMultiplier = 3;
        this.chargedShotRadiusBonus = 4;
        this.chargedShotPierceBonus = 2;
        this.chargedShotTimer = 0;
        this.shieldCooldownFrames = 0;
        this.shieldTimer = 0;
        this.hasShield = false;
        this.lifeStealKillsRequired = 0;
        this.lifeStealCounter = 0;
        this.invulnDurationFrames = 0;
        this.invulnTimer = 0;
        this.upgradeChoicesBonus = 0;
        this.upgradeRerolls = 0;

        // HP System
        this.maxHp = 3;
        this.hp = this.maxHp;
    }

    update(input) {
        // Movement
        if (input.isLeft()) {
            this.x -= this.speed;
        }
        if (input.isRight()) {
            this.x += this.speed;
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;

        if (this.invulnTimer > 0) {
            this.invulnTimer--;
        }
        if (this.chargedShotCooldownFrames > 0) {
            this.chargedShotTimer++;
        }
        if (this.shieldCooldownFrames > 0 && !this.hasShield) {
            this.shieldTimer++;
            if (this.shieldTimer >= this.shieldCooldownFrames) {
                this.hasShield = true;
                this.shieldTimer = 0;
            }
        }

        // Shooting
        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.shoot();
            this.fireTimer = 0;
        }
    }

    draw(ctx) {
        if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;

        // Small barrel to show direction
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 20);

        // Draw Player HP
        ctx.fillStyle = '#0f0';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`HP: ${this.hp}/${this.maxHp}`, 10, 10);

        if (this.hasShield) {
            ctx.strokeStyle = '#8be9ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    shoot() {
        const centerX = this.x + this.width / 2;
        const topY = this.y;
        const isChargedShot = this.chargedShotCooldownFrames > 0 && this.chargedShotTimer >= this.chargedShotCooldownFrames;
        if (isChargedShot) this.chargedShotTimer = 0;
        const projectileRadius = this.projectileRadius + (isChargedShot ? this.chargedShotRadiusBonus : 0);
        const damageMultiplier = isChargedShot ? this.chargedShotDamageMultiplier : 1;
        const pierceBonus = isChargedShot ? this.chargedShotPierceBonus : 0;

        const buildProjectile = (angle) => {
            const isCrit = Math.random() < this.critChance;
            const finalDamage = Math.round(this.projectileDamage * damageMultiplier * (isCrit ? this.critMultiplier : 1));

            return new Projectile(
                this.game,
                centerX,
                topY,
                projectileRadius,
                this.projectileSpeed,
                finalDamage,
                angle,
                {
                    isCrit,
                    pierce: this.pierce + pierceBonus,
                    explosiveRadius: this.explosiveRadius,
                    explosiveEdgeMultiplier: this.explosiveEdgeMultiplier,
                    slowAmount: this.slowOnHit,
                    slowDuration: this.slowDuration
                }
            );
        };

        if (this.projectileCount === 1) {
            this.game.projectiles.push(buildProjectile(-Math.PI / 2));
        } else {
            // For V1, just basic spread if count > 1
            const spreadAngle = 0.2; // roughly 11 degrees
            const startAngle = -Math.PI / 2 - (spreadAngle * (this.projectileCount - 1)) / 2;

            for (let i = 0; i < this.projectileCount; i++) {
                const angle = startAngle + i * spreadAngle;
                this.game.projectiles.push(buildProjectile(angle));
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return false;
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldTimer = 0;
            this.invulnTimer = Math.max(this.invulnTimer, 20);
            return false;
        }

        this.hp -= amount;
        if (this.invulnDurationFrames > 0) {
            this.invulnTimer = this.invulnDurationFrames;
        }
        return true;
    }

    registerKill() {
        if (this.lifeStealKillsRequired <= 0) return;
        this.lifeStealCounter++;
        if (this.lifeStealCounter >= this.lifeStealKillsRequired) {
            this.lifeStealCounter = 0;
            if (this.hp < this.maxHp) {
                this.hp += 1;
            }
        }
    }
}
