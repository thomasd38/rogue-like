class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.touchActive = false;
        this.touchTargetX = null;
        this.touchTargetY = null;
        this.activePointerId = null;
        this.touchYOffset = -30; // Offset for both mouse and touch

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.touchActive = false; // Le clavier prend la priorité
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
            // Pour la souris : suivi simple sans clic (sur le canvas uniquement)
            this.canvas.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'mouse') {
                    this.updateTouchTarget(e.clientX, e.clientY, 'mouse');
                }
            });

            this.canvas.addEventListener('pointerleave', (e) => {
                if (e.pointerType === 'mouse') {
                    this.clearTouch();
                }
            });

            // Pour le tactile/stylet : on commence sur pointerdown (cliquer-glisser)
            this.canvas.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse') return;
                if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
                this.activePointerId = e.pointerId;
                this.updateTouchTarget(e.clientX, e.clientY, e.pointerType);
                e.preventDefault();
            }, { passive: false });

            // Suivi du déplacement pour le tactile (sur window pour permettre de sortir du canvas)
            window.addEventListener('pointermove', (e) => {
                if (e.pointerType !== 'mouse' && this.activePointerId !== null && e.pointerId === this.activePointerId) {
                    this.updateTouchTarget(e.clientX, e.clientY, e.pointerType);
                    e.preventDefault();
                }
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
                    this.updateTouchTarget(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.updateTouchTarget(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchend', () => this.clearTouch(), { passive: true });
            window.addEventListener('touchcancel', () => this.clearTouch(), { passive: true });
        }
    }

    updateTouchTarget(clientX, clientY, pointerType = 'touch') {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.touchActive = true;
        this.touchTargetX = (clientX - rect.left) * scaleX;
        
        // Offset pour la visibilité du vaisseau
        this.touchTargetY = (clientY - rect.top) * scaleY + this.touchYOffset;
    }

    clearTouch() {
        this.touchActive = false;
        this.touchTargetX = null;
        this.touchTargetY = null;
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

    isUp() {
        return this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('KeyZ');
    }

    isDownDir() {
        return this.isDown('ArrowDown') || this.isDown('KeyS');
    }
}
