import * as THREE from 'three';
import Experience from './Experience.js';

/**
 * The God's Palm — the worship grounds of an old god: a flat plateau like an
 * upturned palm, ringed by orange trees. A pillar of light rises from the
 * worship circle at the centre; standing inside it, the god lifts the
 * character skyward with a slow bob.
 *
 * The pillar is a self-contained visual (created on load, removed on
 * dispose) — an additive shader cylinder, not a three.js light, since the
 * scene is shaded entirely by custom sun-based materials.
 *
 * The lift runs after Player.update() has snapped Y to the terrain
 * elevation, so it stacks on top of the ground height each frame.
 */

const BEAM_HEIGHT = 140;

const beamVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main()
    {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const beamFragmentShader = /* glsl */ `
    uniform float uTime;
    uniform float uBoost;
    uniform vec3 uColor;

    varying vec2 vUv;

    void main()
    {
        // Fade out with height, brightest at the ground
        float verticalFade = pow(1.0 - vUv.y, 1.6);

        // Slow upward-drifting ripple, like rising air
        float ripple = 0.85 + 0.15 * sin(vUv.y * 12.0 - uTime * 2.0);

        float alpha = verticalFade * ripple * 0.35 * uBoost;

        gl_FragColor = vec4(uColor, alpha);
    }
`;

export default class GodsPalm extends Experience {
    constructor(config) {
        super(config);

        this.hover = 0;
        this.maxHover = 8;      // float height above the ground
        this.bobAmplitude = 0.6;
        this.bobFrequency = 1.5; // rad/s
        this.bobTime = 0;

        this.beam = null;
        this.beamTime = 0;
    }

    async load() {
        await super.load();
        this.createBeam();
    }

    createBeam() {
        if (this.beam) return;

        // Slightly narrower at the top, open-ended
        const geometry = new THREE.CylinderGeometry(
            this.config.floatRadius * 0.6,
            this.config.floatRadius,
            BEAM_HEIGHT,
            32, 1, true
        );

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uBoost: { value: 1 },
                uColor: { value: new THREE.Color(0xffe9b8) } // warm divine glow
            },
            vertexShader: beamVertexShader,
            fragmentShader: beamFragmentShader
        });

        this.beam = new THREE.Mesh(geometry, material);
        // The flatten centre is exactly targetHeight, so the base sits on the plateau
        this.beam.position.set(
            this.config.position.x,
            this.config.targetHeight + BEAM_HEIGHT * 0.5,
            this.config.position.z
        );

        this.view.scene.add(this.beam);
    }

    update(dt) {
        super.update(dt);

        const player = this.state.player;
        const dx = player.position.current[0] - this.config.position.x;
        const dz = player.position.current[2] - this.config.position.z;
        const inCircle = Math.hypot(dx, dz) < this.config.floatRadius;

        // Framerate-independent ease toward the target hover height
        const target = inCircle ? this.maxHover : 0;
        this.hover += (target - this.hover) * (1 - Math.exp(-2.5 * dt));

        if (this.hover > 0.01) {
            this.bobTime += dt;
            const bob = Math.sin(this.bobTime * this.bobFrequency) * this.bobAmplitude * (this.hover / this.maxHover);
            player.position.current[1] += this.hover + bob;
        } else {
            this.hover = 0;
            this.bobTime = 0;
        }

    }

    passiveUpdate(dt) {
        super.passiveUpdate(dt);

        // Animate the pillar; brighten it while the god holds the character
        if (this.beam) {
            this.beamTime += dt;
            this.beam.material.uniforms.uTime.value = this.beamTime;
            this.beam.material.uniforms.uBoost.value = 1 + (this.hover / this.maxHover) * 0.25;
        }
    }

    onExit() {
        super.onExit();
        this.hover = 0;
        this.bobTime = 0;
    }

    dispose() {
        super.dispose();

        if (this.beam) {
            this.view.scene.remove(this.beam);
            this.beam.geometry.dispose();
            this.beam.material.dispose();
            this.beam = null;
        }
    }
}
