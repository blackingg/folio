import State from './State.js';

/**
 * Standard Gamepad API mapping (matches Xbox / DualSense layout):
 *
 *   axes[0]  — Left stick X   (−1 left → +1 right)
 *   axes[1]  — Left stick Y   (−1 up   → +1 down)
 *   axes[2]  — Right stick X  (−1 left → +1 right)
 *   axes[3]  — Right stick Y  (−1 up   → +1 down)
 *
 *   buttons[4]  — LB / L1
 *   buttons[7]  — RT / R2  (analog, .value 0–1)
 */

const DEADZONE = 0.15;
const DEFAULT_LOOK_SPEED = 0.03;

function applyDeadzone(value) {
    return Math.abs(value) > DEADZONE ? value : 0;
}

export default class GamepadControls {
    constructor() {
        this.state = State.getInstance();
        this.connected = false;
        this.gamepadIndex = null;
        this.preferredIndex = null;
        this.lookSensitivity = DEFAULT_LOOK_SPEED;
        this._boostFromPad = false;

        this._onConnected = (e) => {
            console.log(`[GamepadControls] Connected: "${e.gamepad.id}" (index ${e.gamepad.index})`);
            if (this.preferredIndex === null || this.preferredIndex === e.gamepad.index) {
                this.gamepadIndex = e.gamepad.index;
                this.connected = true;
            }
        };

        this._onDisconnected = (e) => {
            if (e.gamepad.index === this.gamepadIndex) {
                console.log('[GamepadControls] Disconnected');
                this.connected = false;
                this.gamepadIndex = null;
            }
            this._syncActiveGamepad();
        };

        window.addEventListener('gamepadconnected', this._onConnected);
        window.addEventListener('gamepaddisconnected', this._onDisconnected);
    }

    getConnectedGamepads() {
        if (!navigator.getGamepads) return [];

        const pads = navigator.getGamepads();
        const result = [];

        for (const gp of pads) {
            if (gp && gp.connected) {
                result.push({ index: gp.index, id: gp.id });
            }
        }

        return result;
    }

    setPreferredGamepad(index) {
        this.preferredIndex = index;
        this._syncActiveGamepad();
    }

    setLookSensitivity(value) {
        this.lookSensitivity = value;
    }

    _syncActiveGamepad() {
        const connected = this.getConnectedGamepads();

        if (this.preferredIndex !== null) {
            const preferred = connected.find((gp) => gp.index === this.preferredIndex);
            if (preferred) {
                this.gamepadIndex = preferred.index;
                this.connected = true;
                return;
            }
        }

        if (this.gamepadIndex !== null) {
            const current = connected.find((gp) => gp.index === this.gamepadIndex);
            if (current) {
                this.connected = true;
                return;
            }
        }

        this.gamepadIndex = null;
        this.connected = false;
    }

    update() {
        if (!navigator.getGamepads) return;
        if (!this.state.controls.inputEnabled) return;

        this._syncActiveGamepad();

        if (!this.connected || this.gamepadIndex === null) return;

        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        if (!gp || !gp.connected) {
            this.connected = false;
            this.gamepadIndex = null;
            return;
        }

        const keys = this.state.controls.keys.down;

        const lx = applyDeadzone(gp.axes[0]);
        const ly = applyDeadzone(gp.axes[1]);

        // Only override keyboard while the stick is actively moved
        if (ly < -DEADZONE || ly > DEADZONE) {
            keys.forward = ly < -DEADZONE;
            keys.backward = ly > DEADZONE;
        }
        if (lx < -DEADZONE || lx > DEADZONE) {
            keys.strafeLeft = lx < -DEADZONE;
            keys.strafeRight = lx > DEADZONE;
        }

        const boostPressed =
            (gp.buttons[4] && gp.buttons[4].pressed) ||
            (gp.buttons[7] && gp.buttons[7].value > 0.5);
        if (boostPressed) {
            keys.boost = true;
            this._boostFromPad = true;
        } else if (this._boostFromPad) {
            keys.boost = false;
            this._boostFromPad = false;
        }

        const rx = applyDeadzone(gp.axes[2] ?? 0);
        const ry = applyDeadzone(gp.axes[3] ?? 0);

        if (rx !== 0 || ry !== 0) {
            const cam = this.state.player?.camera?.thirdPerson;
            if (cam && cam.active) {
                cam.theta -= rx * this.lookSensitivity;
                cam.phi -= ry * this.lookSensitivity;

                const { min, max } = cam.phiLimits;
                if (cam.phi < min) cam.phi = min;
                if (cam.phi > max) cam.phi = max;
            }
        }
    }

    destroy() {
        window.removeEventListener('gamepadconnected', this._onConnected);
        window.removeEventListener('gamepaddisconnected', this._onDisconnected);
        this.connected = false;
        this.gamepadIndex = null;
    }
}
