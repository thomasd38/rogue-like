class Projectile {
    constructor(game, x, y, radius, speed, damage, angle = -Math.PI / 2, options = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.damage = damage;
        this.isCrit = options.isCrit || false;
        this.pierceRemaining = options.pierce || 0;
        this.explosiveRadius = options.explosiveRadius || 0;
        this.explosiveEdgeMultiplier = options.explosiveEdgeMultiplier || 0.5;
        this.slowAmount = options.slowAmount || 0;
        this.slowDuration = options.slowDuration || 0;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.markedForDeletion = false;
    }


    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Remove if off screen (top)
        if (this.y + this.radius < 0) {
            this.markedForDeletion = true;
        }
        // Remove if off screen (sides) just in case for angled shots
        if (this.x + this.radius < 0 || this.x - this.radius > this.game.width) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isCrit ? '#ff4' : '#ff0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class EnemyProjectile {
    constructor(x, y, radius, speed, damage, targetX, targetY, options = {}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.damage = damage;
        this.markedForDeletion = false;
        this.color = options.color || '#f0f';

        // Calculate velocity towards target
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.hypot(dx, dy);
        
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
    }


    static fromAngle(x, y, radius, speed, damage, angle, options = {}) {
        const targetX = x + Math.cos(angle) * 100;
        const targetY = y + Math.sin(angle) * 100;
        const projectile = new EnemyProjectile(x, y, radius, speed, damage, targetX, targetY, options);
        projectile.vx = Math.cos(angle) * speed;
        projectile.vy = Math.sin(angle) * speed;
        return projectile;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Remove if off screen
        if (this.y - this.radius > 800 || this.y + this.radius < 0 || this.x - this.radius > 600 || this.x + this.radius < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
