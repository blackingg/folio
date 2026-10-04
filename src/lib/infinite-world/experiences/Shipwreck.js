import * as THREE from 'three';
import Experience from './Experience.js';
import AssetManager from '../State/AssetManager.js';

const UPPER_HULL_COLOR = 0x4a4038; // weathered timber, still catching what light reaches this deep
const LOWER_HULL_COLOR = 0x23201d; // waterlogged, silted

/**
 * The shipwreck bay — a broken hull on the seabed of the natural dip at
 * (-42, -214), sampled from the real terrain seed rather than picked by eye
 * (see docs/project-truman/PROJECT_TRUMAN.md). Gives the player's existing
 * "walk the seabed" behaviour (Player.js snaps to terrain elevation
 * everywhere, Underwater.js tints the screen below y=0) an actual
 * destination.
 *
 * `/models/shipwreck.glb` doesn't exist yet — load() falls back to a
 * procedural broken-hull proxy so the zone works without it. Swap the real
 * asset in later; nothing else here needs to change.
 */
export default class Shipwreck extends Experience {
    constructor(config) {
        super(config);
        this.wreck = null;
    }

    async load() {
        await super.load();
        if (this.wreck) return;

        let model = null;
        try {
            const gltf = await AssetManager.getInstance().loadModel(this.config.gltfPaths[0]);
            model = gltf.scene;
        } catch {
            model = this.createProceduralHull();
        }

        const elevation = this.state.chunks.getElevationForPosition(
            this.config.position.x,
            this.config.position.z
        );

        model.position.set(
            this.config.position.x,
            typeof elevation === 'number' ? elevation : this.config.targetHeight,
            this.config.position.z
        );
        model.rotation.y = Math.PI * 0.18;

        this.wreck = model;
        this.view.scene.add(this.wreck);
    }

    createProceduralHull() {
        const group = new THREE.Group();

        // Bow half — longer, broken clean, listing to one side.
        const bow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 2, 10, 10, 1, true, 0, Math.PI),
            new THREE.MeshBasicMaterial({ color: UPPER_HULL_COLOR, side: THREE.DoubleSide })
        );
        bow.rotation.set(0.25, 0, Math.PI * 0.5);
        bow.position.set(-3, 1.6, -0.3);
        group.add(bow);

        // Stern half — shorter, sunk deeper into the silt, opposite list.
        const stern = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 2.2, 6.5, 10, 1, true, 0, Math.PI),
            new THREE.MeshBasicMaterial({ color: LOWER_HULL_COLOR, side: THREE.DoubleSide })
        );
        stern.rotation.set(-0.4, 0, Math.PI * 0.5);
        stern.position.set(4, -0.6, 1);
        group.add(stern);

        // Snapped mast, leaning off what's left of the deck.
        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.26, 7, 6),
            new THREE.MeshBasicMaterial({ color: LOWER_HULL_COLOR })
        );
        mast.position.set(-5, 4, -0.5);
        mast.rotation.set(0.15, 0, 0.55);
        group.add(mast);

        return group;
    }

    dispose() {
        super.dispose();

        if (this.wreck) {
            this.view.scene.remove(this.wreck);
            this.wreck.traverse((child) => {
                child.geometry?.dispose();
                child.material?.dispose();
            });
            this.wreck = null;
        }
    }
}
