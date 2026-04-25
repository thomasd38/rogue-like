class Player {
    constructor(game) {
        this.game = game;
        this.width = 65;
        this.height = 65;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - this.height - 30;
        this.speed = 2;
        this.color = '#0af'; // Cannon color fallback

        // Image loading
        this.image = new Image();
        this.image.src = 'img/player.png';

        // Debug
        this.debug = false; // Set to true to see hitboxes

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

    getHitboxes() {
        // Composite hitbox for high precision (Nose, Core, Wings)
        return [
            // Nose (top center)
            { x: this.x + this.width * 0.4, y: this.y + this.height * 0.05, width: this.width * 0.2, height: this.height * 0.35 },
            // Core / Engine (middle)
            { x: this.x + this.width * 0.3, y: this.y + this.height * 0.4, width: this.width * 0.4, height: this.height * 0.3 },
            // Wings (bottom wide)
            { x: this.x + this.width * 0.05, y: this.y + this.height * 0.7, width: this.width * 0.9, height: this.height * 0.25 }
        ];
    }

    update(input) {
        // Movement
        if (input.touchActive && input.touchTargetX !== null && input.touchTargetY !== null) {
            // Sur mobile, le vaisseau se dirige vers le point touché (l'offset est géré par l'InputHandler)
            const targetX = input.touchTargetX - this.width / 2;
            const targetY = input.touchTargetY - this.height / 2;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist > this.speed) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            } else {
                this.x = targetX;
                this.y = targetY;
            }
        } else {
            // Clavier
            if (input.isLeft()) this.x -= this.speed;
            if (input.isRight()) this.x += this.speed;
            if (input.isUp()) this.y -= this.speed;
            if (input.isDownDir()) this.y += this.speed;
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.game.height) this.y = this.game.height - this.height;

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
        if (this.invulnTimer > 0) {
            // Effet de clignotement pendant l'invulnérabilité
            if (Math.floor(this.invulnTimer / 4) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if image not loaded
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.globalAlpha = 1;

        // Visual Hitbox for testing
        if (this.debug) {
            const hitboxes = this.getHitboxes();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            hitboxes.forEach(hb => {
                ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
            });

            // Central point
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height / 2 - 2, 4, 4);
        }

        // Draw Player HP
        ctx.fillStyle = '#0f0';
        ctx.font = `20px ${window.GAME_FONT}`;
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

            this.game.stats.projectilesFired++; // Suivi des tirs
            if (isCrit || isChargedShot) this.game.stats.criticalHits++; // Suivi des coups critiques

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
            this.invulnTimer = Math.max(this.invulnTimer, 30); // Petit délai après perte bouclier
            return false;
        }

        this.hp -= amount;
        this.game.stats.damageTaken += amount; // Suivi des dégâts reçus
        this.game.applyScreenShake(8, 20); // Tremblement lors des dégâts

        // On donne toujours un minimum d'iframes (1s par défaut) pour éviter de mourir en 1 frame
        this.invulnTimer = Math.max(this.invulnDurationFrames, 60);

        if (this.hp <= 0) {
            this.game.setGameOver();
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
