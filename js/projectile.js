class Projectile {
    constructor(x, y, radius, speed, damage, angle = -Math.PI / 2) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.damage = damage;
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
        if (this.x + this.radius < 0 || this.x - this.radius > 600) { // Assuming 600 width for now, better to pass canvas width
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ff0'; // Yellow projectiles
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class EnemyProjectile {
    constructor(x, y, radius, speed, damage, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.damage = damage;
        this.markedForDeletion = false;

        // Calculate velocity towards target
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.hypot(dx, dy);
        
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
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
        ctx.fillStyle = '#f0f'; // Purple to match boss
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
