import { Vector3 } from 'three'

import Game from '../Game.js'
import State from './State.js'

const SNAP_ANGLE = Math.PI / 4
const SNAP_THRESHOLD = 0.6
const SNAP_REARM = 0.4
const MOVE_DEADZONE = 0.15
const SMOOTH_DEADZONE = 0.15
const STORAGE_KEY = 'iw-vr-turn'

// Reads WebXR controller thumbsticks (xr-standard mapping) each frame while
// presenting: left stick = head-relative locomotion through the shared
// controls.move channel, right stick = snap (default) or smooth rig turning,
// trigger/squeeze = boost. Modeled on GamepadControls.
export default class XRControls
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.controls = this.state.controls
        this.time = this.state.time

        this.turnMode = 'snap'
        if(typeof localStorage !== 'undefined')
        {
            const stored = localStorage.getItem(STORAGE_KEY)
            if(stored === 'smooth' || stored === 'snap')
                this.turnMode = stored
        }
        this.smoothTurnSpeed = 2.5 // rad/s

        this._snapArmed = true
        this._headDirection = new Vector3()
        this._wasActive = false
        this._boostActive = false
    }

    setTurnMode(mode)
    {
        if(mode !== 'snap' && mode !== 'smooth') return
        this.turnMode = mode
        if(typeof localStorage !== 'undefined')
            localStorage.setItem(STORAGE_KEY, mode)
    }

    _resetMove()
    {
        const move = this.controls.move
        move.x = 0
        move.z = 0
        move.active = false
        // Clear so the touch/joystick path falls back to the camera orbit yaw
        move.headYaw = undefined
        this._wasActive = false
        if(this._boostActive)
        {
            this.controls.keys.down.boost = false
            this._boostActive = false
        }
    }

    update()
    {
        const view = this.game.view
        const renderer = view?.renderer?.instance

        if(!renderer?.xr?.isPresenting)
        {
            // Session just ended with the stick still pushed
            if(this._wasActive) this._resetMove()
            return
        }

        if(!this.controls.inputEnabled) return

        const session = renderer.xr.getSession()
        if(!session) return

        let moveX = 0
        let moveY = 0
        let turnX = 0
        let boost = false

        for(const source of session.inputSources)
        {
            const gamepad = source.gamepad
            if(!gamepad) continue

            // xr-standard mapping: thumbstick on axes[2]/[3]; some runtimes
            // expose a touchpad-only device on [0]/[1]
            const x = gamepad.axes[2] ?? gamepad.axes[0] ?? 0
            const y = gamepad.axes[3] ?? gamepad.axes[1] ?? 0

            if(source.handedness === 'left')
            {
                moveX = x
                moveY = y
            }
            else if(source.handedness === 'right')
            {
                turnX = x
            }

            // Trigger (0) or squeeze (1) on either hand boosts
            if(gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed)
                boost = true
        }

        // Locomotion — head-relative so walking follows where you look
        if(Math.hypot(moveX, moveY) > MOVE_DEADZONE)
        {
            view.camera.instance.getWorldDirection(this._headDirection)

            const move = this.controls.move
            move.x = moveX
            move.z = - moveY // stick forward is negative Y in xr-standard
            move.headYaw = Math.atan2(- this._headDirection.x, - this._headDirection.z)
            move.active = true
            this._wasActive = true
        }
        else if(this._wasActive)
        {
            this._resetMove()
        }

        // Turning rotates the rig, not the player
        if(this.turnMode === 'smooth')
        {
            if(Math.abs(turnX) > SMOOTH_DEADZONE)
                view.camera.rigYaw -= turnX * this.smoothTurnSpeed * this.time.delta
        }
        else
        {
            if(this._snapArmed && Math.abs(turnX) > SNAP_THRESHOLD)
            {
                view.camera.rigYaw -= Math.sign(turnX) * SNAP_ANGLE
                this._snapArmed = false
            }
            else if(Math.abs(turnX) < SNAP_REARM)
            {
                this._snapArmed = true
            }
        }

        if(boost !== this._boostActive)
        {
            this.controls.keys.down.boost = boost
            this._boostActive = boost
        }
    }

    destroy()
    {
        this._resetMove()
    }
}
