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
        this.fireRate = 100; // Frames between shots (lower is faster)
        this.fireTimer = 0;
        this.projectileSpeed = 10;
        this.projectileDamage = 10;
        this.projectileRadius = 5;
        this.projectileCount = 1;
        
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

        // Shooting
        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.shoot();
            this.fireTimer = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Small barrel to show direction
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 20);

        // Draw Player HP
        ctx.fillStyle = '#0f0';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`HP: ${this.hp}/${this.maxHp}`, 10, 10);
    }

    shoot() {
        const centerX = this.x + this.width / 2;
        const topY = this.y;

        if (this.projectileCount === 1) {
            this.game.projectiles.push(new Projectile(
                centerX,
                topY,
                this.projectileRadius,
                this.projectileSpeed,
                this.projectileDamage
            ));
        } else {
            // For V1, just basic spread if count > 1
            const spreadAngle = 0.2; // roughly 11 degrees
            const startAngle = -Math.PI / 2 - (spreadAngle * (this.projectileCount - 1)) / 2;

            for (let i = 0; i < this.projectileCount; i++) {
                const angle = startAngle + i * spreadAngle;
                this.game.projectiles.push(new Projectile(
                    centerX,
                    topY,
                    this.projectileRadius,
                    this.projectileSpeed,
                    this.projectileDamage,
                    angle
                ));
            }
        }
    }
}
