class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.touchActive = false;
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchCurrentX = null;
        this.touchCurrentY = null;
        this.activePointerId = null;
        this.touchThreshold = 15; // Seuil en pixels pour déclencher le mouvement

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
                this.startTouch(e.clientX, e.clientY);
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('pointermove', (e) => {
                if (this.activePointerId === null || e.pointerId !== this.activePointerId) return;
                this.moveTouch(e.clientX, e.clientY);
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
            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    this.startTouch(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.moveTouch(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchend', () => this.clearTouch(), { passive: true });
            window.addEventListener('touchcancel', () => this.clearTouch(), { passive: true });
        }
    }

    getCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    startTouch(clientX, clientY) {
        const coords = this.getCanvasCoordinates(clientX, clientY);
        this.touchActive = true;
        this.touchStartX = coords.x;
        this.touchStartY = coords.y;
        this.touchCurrentX = coords.x;
        this.touchCurrentY = coords.y;
    }

    moveTouch(clientX, clientY) {
        const coords = this.getCanvasCoordinates(clientX, clientY);
        this.touchCurrentX = coords.x;
        this.touchCurrentY = coords.y;
    }

    clearTouch() {
        this.touchActive = false;
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchCurrentX = null;
        this.touchCurrentY = null;
    }

    isDown(code) {
        return this.keys[code] === true;
    }

    isLeft() {
        const key = this.isDown('ArrowLeft') || this.isDown('KeyQ') || this.isDown('KeyA');
        const touch = this.touchActive && (this.touchCurrentX - this.touchStartX < -this.touchThreshold);
        return key || touch;
    }

    isRight() {
        const key = this.isDown('ArrowRight') || this.isDown('KeyD');
        const touch = this.touchActive && (this.touchCurrentX - this.touchStartX > this.touchThreshold);
        return key || touch;
    }

    isUp() {
        const key = this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('KeyZ');
        const touch = this.touchActive && (this.touchCurrentY - this.touchStartY < -this.touchThreshold);
        return key || touch;
    }

    isDownDir() {
        const key = this.isDown('ArrowDown') || this.isDown('KeyS');
        const touch = this.touchActive && (this.touchCurrentY - this.touchStartY > this.touchThreshold);
        return key || touch;
    }
}
