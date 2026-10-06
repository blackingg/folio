import { vec3 } from 'gl-matrix'

import Game from '../Game.js'
import State from './State.js'
import Camera from './Camera.js'
import { BORDER, TERRAIN_SEED, createBorder, wallCollisionHalfWidth } from '../worldGen.js'
import { getPreciseElevation } from './TerrainElevation.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        this.controls = this.state.controls

        this.rotation = 0
        this.inputSpeed = 14
        this.inputBoostSpeed = 42
        this.inputSwimSpeed = 8
        this.swimBuoyancy = -2
        this.swimVelocityY = 0
        this.speed = 0
        this.swimming = false

        this.position = {}
        this.position.current = vec3.fromValues(10, 0, 1)
        this.position.previous = vec3.clone(this.position.current)
        this.position.delta = vec3.create()

        this.border = createBorder(TERRAIN_SEED)
        this.borderHalfWidth = wallCollisionHalfWidth()

        this.camera = new Camera(this)
    }

    update()
    {
        // Control override guard
        if (this.game.experienceManager && this.game.experienceManager.activeExperience?.config?.overridesControls) {
            return; // Freeze movement if experience takes over
        }

        if(this.camera.mode !== Camera.MODE_FLY && this.controls.move.active)
        {
            // Analog movement (touch joystick / XR thumbstick): x = right,
            // z = forward relative to the reference yaw — the camera orbit
            // normally, or the headset yaw while presenting (set by XRControls
            // as move.headYaw). Same sign convention as the key branch below.
            const move = this.controls.move
            const magnitude = Math.min(1, Math.hypot(move.x, move.z))
            const referenceYaw = move.headYaw ?? this.camera.thirdPerson.theta

            this.rotation = referenceYaw - Math.atan2(move.x, move.z)

            const speed = (this.controls.keys.down.boost ? this.inputBoostSpeed : this.inputSpeed) * magnitude

            this.position.current[0] -= Math.sin(this.rotation) * this.time.delta * speed
            this.position.current[2] -= Math.cos(this.rotation) * this.time.delta * speed
        }
        else if(this.camera.mode !== Camera.MODE_FLY && (this.controls.keys.down.forward || this.controls.keys.down.backward || this.controls.keys.down.strafeLeft || this.controls.keys.down.strafeRight))
        {
            this.rotation = this.camera.thirdPerson.theta

            if(this.controls.keys.down.forward)
            {
                if(this.controls.keys.down.strafeLeft)
                    this.rotation += Math.PI * 0.25
                else if(this.controls.keys.down.strafeRight)
                    this.rotation -= Math.PI * 0.25
            }
            else if(this.controls.keys.down.backward)
            {
                if(this.controls.keys.down.strafeLeft)
                    this.rotation += Math.PI * 0.75
                else if(this.controls.keys.down.strafeRight)
                    this.rotation -= Math.PI * 0.75
                else
                    this.rotation -= Math.PI
            }
            else if(this.controls.keys.down.strafeLeft)
            {
                this.rotation += Math.PI * 0.5
            }
            else if(this.controls.keys.down.strafeRight)
            {
                this.rotation -= Math.PI * 0.5
            }

            const speed = this.controls.keys.down.boost ? this.inputBoostSpeed : this.inputSpeed

            const x = Math.sin(this.rotation) * this.time.delta * speed
            const z = Math.cos(this.rotation) * this.time.delta * speed

            this.position.current[0] -= x
            this.position.current[2] -= z
        }

        // Tree collision — only against chunks overlapping the player's
        // collision circle, instead of every tree in the loaded world.
        // Padded because jittered trees can sit up to half a terrain segment
        // (1.6u on depth-3 chunks) outside the chunk that emitted them.
        const collisionRadius = 0.8;
        const chunkQueryPadding = 2;
        const queryRadius = collisionRadius + chunkQueryPadding;
        const nearbyChunks = this.state.chunks.getTerrainChunksForArea(
            this.position.current[0] - queryRadius,
            this.position.current[0] + queryRadius,
            this.position.current[2] - queryRadius,
            this.position.current[2] + queryRadius
        );
        for (const chunk of nearbyChunks) {
            if (!chunk.terrain.trees) continue;
            for (const tree of chunk.terrain.trees) {
                const dx = this.position.current[0] - tree.position[0];
                const dz = this.position.current[2] - tree.position[2];
                const distSq = dx * dx + dz * dz;
                if (distSq < collisionRadius * collisionRadius && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const push = collisionRadius - dist;
                    this.position.current[0] += (dx / dist) * push;
                    this.position.current[2] += (dz / dist) * push;
                }
            }
        }

        // Border wall collision — an analytic band around the coastline, so the
        // wall holds even if a frame spike tunnels past the per-tree circles.
        // The gate opening is the only place the band lets the player through.
        {
            const px = this.position.current[0]
            const pz = this.position.current[2]
            const dist = Math.hypot(px, pz)
            const theta = Math.atan2(pz, px)
            const wallRadius = this.border.radiusAt(theta)
            const inGate = this.border.gateArcDistance(theta, wallRadius) < BORDER.gateWidth * 0.5

            if (!inGate && dist > 0.0001 && Math.abs(dist - wallRadius) < this.borderHalfWidth) {
                // Push back out on the side the player came from
                const prevDist = Math.hypot(this.position.previous[0], this.position.previous[2])
                const prevTheta = Math.atan2(this.position.previous[2], this.position.previous[0])
                const side = Math.sign(prevDist - this.border.radiusAt(prevTheta)) || -1
                const targetDist = wallRadius + side * this.borderHalfWidth

                this.position.current[0] = (px / dist) * targetDist
                this.position.current[2] = (pz / dist) * targetDist
            }
        }

        // Elevation must land before camera.update() reads position.current —
        // otherwise the camera orbits around last frame's height for a frame
        // every time elevation changes, which shows up as the camera lagging
        // behind the player vertically (most visible on slopes / low frame
        // rates, e.g. mobile). Sampled from the analytic formula directly
        // (not the render mesh) so it's exact regardless of quality tier —
        // interpolating a quality-tier-coarsened mesh here let narrow water
        // features get smoothed over and disappear on low/medium tier.
        const groundY = getPreciseElevation(this.position.current[0], this.position.current[2])

        if (groundY < 0) {
            // Momentum-based, not snapped: gentle passive buoyancy sinks you
            // on entry (no key needed to go under), jump/crouch apply thrust
            // rather than teleport, velocity zeroes out at the seabed/surface
            // bounds instead of just clamping position.
            if (!this.swimming) {
                this.swimVelocityY = 0
                this.swimming = true
            }

            let accel = this.swimBuoyancy
            if (this.controls.keys.down.jump) accel += this.inputSwimSpeed
            if (this.controls.keys.down.crouch) accel -= this.inputSwimSpeed

            this.swimVelocityY += accel * this.time.delta
            this.swimVelocityY = Math.max(-this.inputSwimSpeed, Math.min(this.inputSwimSpeed, this.swimVelocityY))

            this.position.current[1] += this.swimVelocityY * this.time.delta

            if (this.position.current[1] >= 0) {
                this.position.current[1] = 0
                this.swimVelocityY = Math.min(this.swimVelocityY, 0)
            } else if (this.position.current[1] <= groundY) {
                this.position.current[1] = groundY
                this.swimVelocityY = Math.max(this.swimVelocityY, 0)
            }
        } else {
            this.swimVelocityY = 0
            this.position.current[1] = groundY
            this.swimming = false
        }

        // Experience collision — e.g. Shipwreck.js#collide — runs after elevation/swim Y lands.
        // previous is passed so a fast-moving frame can be swept for tunnelling
        // instead of only checking the final landing point.
        if (this.game.experienceManager && this.game.experienceManager.activeExperience) {
            this.game.experienceManager.activeExperience.collide?.(this.position.current, this.position.previous)
        }

        vec3.sub(this.position.delta, this.position.current, this.position.previous)
        vec3.copy(this.position.previous, this.position.current)

        this.speed = vec3.len(this.position.delta)

        // Check Experiences trigger zones
        if (this.game.experienceManager) {
            this.game.experienceManager.checkZones(this.position.current);
        }

        // Update view
        this.camera.update()
    }
}