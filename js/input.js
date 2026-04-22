class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.touchActive = false;
        this.touchTargetX = null;
        this.activePointerId = null;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        if (this.canvas) {
            this.setupTouchControls();
        }
    }

    setupTouchControls() {
        if (window.PointerEvent) {
            this.canvas.addEventListener('pointerdown', (e) => {
                if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
                this.activePointerId = e.pointerId;
                this.handlePointerPosition(e.clientX);
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('pointermove', (e) => {
                if (this.activePointerId === null || e.pointerId !== this.activePointerId) return;
                this.handlePointerPosition(e.clientX);
                e.preventDefault();
            }, { passive: false });

            const stopPointerControl = (e) => {
                if (this.activePointerId !== null && e.pointerId === this.activePointerId) {
                    this.clearTouch();
                    this.activePointerId = null;
                }
            };

            window.addEventListener('pointerup', stopPointerControl, { passive: true });
            window.addEventListener('pointercancel', stopPointerControl, { passive: true });
        } else {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
            window.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
            window.addEventListener('touchend', () => this.clearTouch(), { passive: true });
            window.addEventListener('touchcancel', () => this.clearTouch(), { passive: true });
        }
    }

    handlePointerPosition(clientX) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const localX = (clientX - rect.left) * scaleX;

        this.touchActive = true;
        this.touchTargetX = Math.max(0, Math.min(this.canvas.width, localX));
    }

    handleTouch(e) {
        if (e.touches.length === 0) {
            this.clearTouch();
            return;
        }

        const touch = e.touches[0];
        this.handlePointerPosition(touch.clientX);
        e.preventDefault();
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
        return this.isDown('ArrowLeft') || this.isDown('KeyQ') || this.isDown('KeyA');
    }

    isRight() {
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
}
