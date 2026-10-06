import * as THREE from 'three';

import Game from '../Game.js';
import View from './View.js';
import State from '../State/State.js';

// Was min(0.85 + depth*0.01, 1.0) — fully opaque (blind) by 15 units deep,
// well inside the rivers/shipwreck basin's 16-25u range.
const UNDERWATER_OPACITY_MIN = 0.35
const UNDERWATER_OPACITY_MAX = 0.62
const UNDERWATER_OPACITY_PER_DEPTH = 0.01

export default class Underwater {
    constructor() {
        this.game = Game.getInstance();
        this.view = View.getInstance();
        this.state = State.getInstance();
        this.camera = this.view.camera;

        this.setInstance();
    }

    setInstance() {
        // Create a plane that sits slightly in front of the camera
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.material = new THREE.MeshBasicMaterial({
            color: '#0a3a66',
            transparent: true,
            opacity: UNDERWATER_OPACITY_MIN,
            depthTest: false,
            depthWrite: false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;
        
        // Add directly to the camera so it follows perfectly without delay
        // We put it at z = -0.2 (in front of camera)
        this.mesh.position.z = -0.2;
        this.mesh.visible = false;

        this.camera.instance.add(this.mesh);
    }

    update() {
        const playerState = this.state.player;
        
        // If camera Y position drops below water level (0)
        if (playerState.camera.position[1] < 0) {
            this.mesh.visible = true;
            
            // Murkier the deeper you go, but never fully opaque — see note above.
            const depth = Math.abs(playerState.camera.position[1]);
            this.material.opacity = Math.min(
                UNDERWATER_OPACITY_MIN + depth * UNDERWATER_OPACITY_PER_DEPTH,
                UNDERWATER_OPACITY_MAX
            );
        } else {
            this.mesh.visible = false;
        }
    }
}
