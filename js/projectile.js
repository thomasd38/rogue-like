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
