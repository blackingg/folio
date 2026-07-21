import EventsEmitter from 'events'

import Game from '../Game.js'
import State from './State.js'

export default class Controls
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()

        this.events = new EventsEmitter()

        this.inputEnabled = true

        // Analog movement channel — fed by the touch joystick and XR
        // thumbstick. x = right, z = forward, both in [-1, 1]; Player uses
        // it instead of the boolean key branch while active.
        this.move = { x: 0, z: 0, active: false }

        this._onKeyDown = (event) =>
        {
            if (!this.inputEnabled) return

            const mapItem = this.keys.findPerCode(event.code)

            if(mapItem)
            {
                this.events.emit('keyDown', mapItem.name)
                this.events.emit(`${mapItem.name}Down`)
                this.keys.down[mapItem.name] = true
            }
        }

        this._onKeyUp = (event) =>
        {
            if (!this.inputEnabled) return

            const mapItem = this.keys.findPerCode(event.code)

            if(mapItem)
            {
                this.events.emit('keyUp', mapItem.name)
                this.events.emit(`${mapItem.name}Up`)
                this.keys.down[mapItem.name] = false
            }
        }

        this.setKeys()
        this.setPointer()

        this.events.on('debugDown', () =>
        {
            if(location.hash === '#debug')
                location.hash = ''
            else
                location.hash = 'debug'

            location.reload()
        })
    }

    setKeys()
    {
        this.keys = {}

        // Map
        this.keys.map = [
            {
                codes: [ 'ArrowUp', 'KeyW' ],
                name: 'forward'
            },
            {
                codes: [ 'ArrowRight', 'KeyD' ],
                name: 'strafeRight'
            },
            {
                codes: [ 'ArrowDown', 'KeyS' ],
                name: 'backward'
            },
            {
                codes: [ 'ArrowLeft', 'KeyA' ],
                name: 'strafeLeft'
            },
            {
                codes: [ 'ShiftLeft', 'ShiftRight' ],
                name: 'boost'
            },
            {
                codes: [ 'KeyP' ],
                name: 'pointerLock'
            },
            {
                codes: [ 'KeyV' ],
                name: 'cameraMode'
            },
            {
                codes: [ 'KeyB' ],
                name: 'debug'
            },
            {
                codes: [ 'KeyF' ],
                name: 'fullscreen'
            },
            {
                codes: [ 'Space' ],
                name: 'jump'
            },
            {
                codes: [ 'ControlLeft', 'KeyC' ],
                name: 'crouch'
            },
        ]

        // Down keys
        this.keys.down = {}

        for(const mapItem of this.keys.map)
        {
            this.keys.down[mapItem.name] = false
        }

        // Find in map per code
        this.keys.findPerCode = (key) =>
        {
            return this.keys.map.find((mapItem) => mapItem.codes.includes(key))
        }

        window.addEventListener('keydown', this._onKeyDown)
        window.addEventListener('keyup', this._onKeyUp)
    }

    setPointer()
    {
        this.pointer = {}
        this.pointer.down = false
        this.pointer.deltaTemp = { x: 0, y: 0 }
        this.pointer.delta = { x: 0, y: 0 }

        // Touch look-drag: movementX/Y is always 0 for touch, so deltas are
        // computed from clientX/Y. Only touches that start on the game
        // canvas are adopted — joystick/HUD touches have other targets.
        this.touchLookId = null
        this.touchLast = { x: 0, y: 0 }

        this._onPointerDown = (event) =>
        {
            if(event.pointerType === 'touch')
            {
                if(this.touchLookId === null && this.game.domElement.contains(event.target))
                {
                    this.touchLookId = event.pointerId
                    this.touchLast.x = event.clientX
                    this.touchLast.y = event.clientY
                    this.pointer.down = true
                }
                return
            }
            this.pointer.down = true
        }
        this._onPointerMove = (event) =>
        {
            if(event.pointerType === 'touch')
            {
                if(event.pointerId !== this.touchLookId) return
                this.pointer.deltaTemp.x += event.clientX - this.touchLast.x
                this.pointer.deltaTemp.y += event.clientY - this.touchLast.y
                this.touchLast.x = event.clientX
                this.touchLast.y = event.clientY
                return
            }
            this.pointer.deltaTemp.x += event.movementX
            this.pointer.deltaTemp.y += event.movementY
        }
        this._onPointerUp = (event) =>
        {
            if(event.pointerType === 'touch')
            {
                if(event.pointerId === this.touchLookId)
                {
                    this.touchLookId = null
                    this.pointer.down = false
                }
                return
            }
            this.pointer.down = false
        }

        window.addEventListener('pointerdown', this._onPointerDown)
        window.addEventListener('pointermove', this._onPointerMove)
        window.addEventListener('pointerup', this._onPointerUp)
        window.addEventListener('pointercancel', this._onPointerUp)
    }

    update()
    {
        this.pointer.delta.x = this.pointer.deltaTemp.x
        this.pointer.delta.y = this.pointer.deltaTemp.y

        this.pointer.deltaTemp.x = 0
        this.pointer.deltaTemp.y = 0
    }

    destroy()
    {
        this.inputEnabled = false
        window.removeEventListener('keydown', this._onKeyDown)
        window.removeEventListener('keyup', this._onKeyUp)
        window.removeEventListener('pointerdown', this._onPointerDown)
        window.removeEventListener('pointermove', this._onPointerMove)
        window.removeEventListener('pointerup', this._onPointerUp)
        window.removeEventListener('pointercancel', this._onPointerUp)
    }
}
