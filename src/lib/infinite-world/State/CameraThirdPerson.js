import { vec3, quat2, mat4 } from 'gl-matrix'

import State from './State.js'

export default class CameraThirdPerson
{
    constructor(player)
    {
        this.state = State.getInstance()
        this.viewport = this.state.viewport
        this.controls = this.state.controls
        this.time = this.state.time

        this.player = player

        this.active = false
        this.gameUp = vec3.fromValues(0, 1, 0)
        this.position = vec3.create()
        this.quaternion = quat2.create()
        this.distance = 15
        this.phi = Math.PI * 0.45
        this.theta = - Math.PI * 0.25
        this.aboveOffset = 2
        this.phiLimits = { min: 0.1, max: Math.PI - 0.1 }

        // Soft follow: how fast the orbit eases behind the moving player
        // (exponential damping rate — ~95% caught up after one second)
        this.followLambda = 3
    }

    activate()
    {
        this.active = true
    }

    deactivate()
    {
        this.active = false
    }

    update()
    {
        if(!this.active)
            return

        // Phi and theta
        if(this.controls.pointer.down || this.viewport.pointerLock.active)
        {
            const normalisedPointer = this.viewport.normalise(this.controls.pointer.delta)
            this.phi -= normalisedPointer.y * 2
            this.theta -= normalisedPointer.x * 2

            if(this.phi < this.phiLimits.min)
                this.phi = this.phiLimits.min
            if(this.phi > this.phiLimits.max)
                this.phi = this.phiLimits.max
        }
        else
        {
            // Soft follow — when the player is moving and the camera isn't
            // being dragged, ease theta around behind the movement direction
            // so the character ends up facing away from the camera.
            const keys = this.controls.keys.down
            const moving = keys.forward || keys.backward || keys.strafeLeft || keys.strafeRight || this.controls.move?.active

            if(moving)
            {
                const diff = Math.atan2(
                    Math.sin(this.player.rotation - this.theta),
                    Math.cos(this.player.rotation - this.theta)
                )

                // Backward-ish movement (S, back-diagonals) would ask the
                // camera to swing ~180° — leave it planted instead.
                if(Math.abs(diff) < Math.PI * 0.75)
                    this.theta += diff * (1 - Math.exp(- this.followLambda * this.time.delta))
            }
        }

        // Position
        const sinPhiRadius = Math.sin(this.phi) * this.distance
        const sphericalPosition = vec3.fromValues(
            sinPhiRadius * Math.sin(this.theta),
            Math.cos(this.phi) * this.distance,
            sinPhiRadius * Math.cos(this.theta)
        )
        vec3.add(this.position, this.player.position.current, sphericalPosition)

        // Target
        const target = vec3.fromValues(
            this.player.position.current[0],
            this.player.position.current[1] + this.aboveOffset,
            this.player.position.current[2]
        )

        // Quaternion
        const toTargetMatrix = mat4.create()
        mat4.targetTo(toTargetMatrix, this.position, target, this.gameUp)
        quat2.fromMat4(this.quaternion, toTargetMatrix)
        
        // Clamp to ground
        const chunks = this.state.chunks
        const elevation = chunks.getElevationForPosition(this.position[0], this.position[2])

        if(elevation && this.position[1] < elevation + 1)
            this.position[1] = elevation + 1
    }
}