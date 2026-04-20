class InputHandler {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
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
