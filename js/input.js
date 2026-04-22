class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.touchActive = false;
        this.touchTargetX = null;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        if (this.canvas) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
            this.canvas.addEventListener('touchend', () => this.clearTouch(), { passive: false });
            this.canvas.addEventListener('touchcancel', () => this.clearTouch(), { passive: false });
        }
    }

    handleTouch(e) {
        if (e.touches.length === 0) {
            this.clearTouch();
            return;
        }

        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const localX = (touch.clientX - rect.left) * scaleX;

        this.touchActive = true;
        this.touchTargetX = localX;
    }

    clearTouch() {
        this.touchActive = false;
        this.touchTargetX = null;
    }

    hasTouchControl() {
        return this.touchActive && this.touchTargetX !== null;
    }

    getTouchTargetX() {
        return this.touchTargetX;
    }

    isDown(code) {
        return this.keys[code] === true;
    }

    isLeft() {
        return this.isDown('ArrowLeft') || this.isDown('KeyQ') || this.isDown('KeyA'); // Added KeyA for QWERTY/AZERTY compat
    }

    isRight() {
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
}
