import { Mesh, PlaneGeometry, Color, Vector3, Vector2, CanvasTexture } from 'three';

import View from './View.js'
import State from '../State/State.js'
import WaterMaterial from './Materials/WaterMaterial.js'

// Reflection-glitch pacing — see docs/project-truman/WATER_REFLECTION_GLITCH_PLAN.md.
// Fires anywhere water is visible (no restriction to specific water bodies).
const GLITCH_MIN_INTERVAL = 40 // seconds
const GLITCH_MAX_INTERVAL = 90 // seconds
const GLITCH_PULSE_DURATION = 0.45 // seconds, full ramp-up + hold + ramp-down
const GLITCH_RADIUS = 30 // world units from the player the glimpse can appear at

/**
 * A generic rig silhouette (tripod + boom + mic), hand-drawn as a small
 * alpha mask. Deliberately not the camera-rig easter egg's model — this is
 * a flat glimpse for under a second, not a found object.
 */
function createGlitchTexture()
{
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    // Tripod legs
    ctx.beginPath()
    ctx.moveTo(size * 0.5, size * 0.45)
    ctx.lineTo(size * 0.25, size * 0.95)
    ctx.moveTo(size * 0.5, size * 0.45)
    ctx.lineTo(size * 0.5, size * 0.95)
    ctx.moveTo(size * 0.5, size * 0.45)
    ctx.lineTo(size * 0.75, size * 0.95)
    ctx.stroke()

    // Boom arm reaching up and out of frame
    ctx.beginPath()
    ctx.moveTo(size * 0.5, size * 0.45)
    ctx.lineTo(size * 0.15, size * 0.1)
    ctx.stroke()

    // Mic at the end of the boom
    ctx.beginPath()
    ctx.ellipse(size * 0.12, size * 0.08, size * 0.08, size * 0.05, -0.4, 0, Math.PI * 2)
    ctx.fill()

    const texture = new CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export default class Water
{
    constructor()
    {
        this.view = View.getInstance()
        this.state = State.getInstance()
        this.scene = this.view.scene

        this.material = new WaterMaterial()
        this.material.uniforms.uBaseColor.value = new Color('#1d3456')
        this.material.uniforms.uFresnelOffset.value = 0
        this.material.uniforms.uFresnelScale.value = 0.5
        this.material.uniforms.uFresnelPower.value = 2
        this.material.uniforms.uSunPosition.value = new Vector3(- 0.5, - 0.5, - 0.5)
        this.material.uniforms.uMoonPosition.value = new Vector3(- 0.5, - 0.5, - 0.5)
        this.material.uniforms.uGlitchUv.value = new Vector2(0.5, 0.5)
        this.material.uniforms.uGlitchTexture.value = createGlitchTexture()

        this.mesh = new Mesh(
            new PlaneGeometry(1000, 1000),
            this.material
        )
        this.mesh.geometry.rotateX(- Math.PI * 0.5)
        this.scene.add(this.mesh)

        this.glitchTimer = GLITCH_MIN_INTERVAL + Math.random() * (GLITCH_MAX_INTERVAL - GLITCH_MIN_INTERVAL)
        this.glitchElapsed = 0
        this.glitching = false
    }

    updateGlitch(dt)
    {
        const uniforms = this.material.uniforms

        if (this.glitching)
        {
            this.glitchElapsed += dt
            const t = this.glitchElapsed / GLITCH_PULSE_DURATION

            if (t >= 1)
            {
                this.glitching = false
                uniforms.uGlitchStrength.value = 0
                this.glitchTimer = GLITCH_MIN_INTERVAL + Math.random() * (GLITCH_MAX_INTERVAL - GLITCH_MIN_INTERVAL)
            }
            else
            {
                // One coordinated pulse (ramp up / hold / ramp down), not noise
                uniforms.uGlitchStrength.value = t < 0.3
                    ? t / 0.3
                    : t > 0.7
                        ? (1 - t) / 0.3
                        : 1
            }
        }
        else
        {
            this.glitchTimer -= dt

            if (this.glitchTimer <= 0)
            {
                this.glitching = true
                this.glitchElapsed = 0

                const angle = Math.random() * Math.PI * 2
                const radius = GLITCH_RADIUS * (0.4 + Math.random() * 0.6)
                uniforms.uGlitchUv.value.set(
                    0.5 + (Math.cos(angle) * radius) / 1000,
                    0.5 + (Math.sin(angle) * radius) / 1000
                )
            }
        }
    }

    update()
    {
        const playerState = this.state.player
        const sunState = this.state.sun
        const moonState = this.state.moon
        const dayState = this.state.day

        this.mesh.position.set(
            playerState.position.current[0],
            0,
            playerState.position.current[2]
        )

        const uniforms = this.material.uniforms
        uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
        uniforms.uMoonPosition.value.set(moonState.position.x, moonState.position.y, moonState.position.z)
        uniforms.uDayCycleProgress.value = dayState.progress

        this.updateGlitch(this.state.time.delta)
    }
}