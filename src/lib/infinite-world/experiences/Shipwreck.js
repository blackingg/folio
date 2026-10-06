import * as THREE from 'three';
import Experience from './Experience.js';
import AssetManager from '../State/AssetManager.js';
import collisionCells from './shipwreckCollisionCells.js';

const UPPER_HULL_COLOR = 0x4a4038; // weathered timber, still catching what light reaches this deep
const LOWER_HULL_COLOR = 0x23201d; // waterlogged, silted
const COLLISION_RADIUS = 0.8; // matches Player.js's tree collision radius

/**
 * The shipwreck bay — a broken hull on the seabed of the largest natural
 * basin in the world, at (-11, -288), sited by sampling the real terrain
 * seed rather than picked by eye — two rivers converge here (see
 * docs/project-truman/PROJECT_TRUMAN.md). Gives the player's existing
 * "walk the seabed" behaviour (Player.js snaps to terrain elevation
 * everywhere, Underwater.js tints the screen below y=0) an actual
 * destination.
 *
 * load() tries the authored asset (unlit-converted + recentred via
 * AssetManager.loadUnlitModel — see unlitGLTF.js) and falls back to a
 * procedural broken-hull proxy if it's missing, so the zone works either
 * way.
 */
export default class Shipwreck extends Experience {
    constructor(config) {
        super(config);
        this.wreck = null;
        this.isRealModel = false;
        this.collisionCells = new Set(collisionCells.map(([x, y, z]) => `${x},${y},${z}`));
    }

    async load() {
        await super.load();
        if (this.wreck) return;

        let model;
        try {
            model = await AssetManager.getInstance().loadUnlitModel(this.config.gltfPaths[0]);
            this.isRealModel = true;
        } catch {
            model = this.createProceduralHull();
        }

        const elevation = this.state.chunks.getElevationForPosition(
            this.config.position.x,
            this.config.position.z
        );

        // The authored asset's model.position.y already holds the recentre
        // offset from loadUnlitModel() (its lowest point moved to local
        // y=0) — add the seabed elevation to that instead of overwriting
        // it, or the recentring is silently discarded and the model's true
        // geometric bottom (not local 0) ends up however far below the
        // seabed it naturally sits. The procedural hull starts at y=0, so
        // += behaves the same as a plain assignment for it.
        model.position.x = this.config.position.x;
        model.position.y += typeof elevation === 'number' ? elevation : this.config.targetHeight;
        model.position.z = this.config.position.z;
        model.rotation.y = Math.PI * 0.18;

        this.wreck = model;
        this.view.scene.add(this.wreck);
    }

    // Push a single local-space point out of any voxel cell it's embedded in.
    // Returns [x, y, z, moved] — moved is true iff a push was applied, used
    // by collide() below to detect where along a swept path a wall was hit.
    resolvePoint(lx, ly, lz) {
        // Only the 3x3x3 neighbourhood can be within COLLISION_RADIUS (<1 cell).
        const cx = Math.floor(lx), cy = Math.floor(ly), cz = Math.floor(lz);
        let moved = false;

        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                for (let iz = -1; iz <= 1; iz++) {
                    const ccx = cx + ix, ccy = cy + iy, ccz = cz + iz;
                    if (!this.collisionCells.has(`${ccx},${ccy},${ccz}`)) continue;

                    // Closest point on this unit-cube cell to the player.
                    const closestX = Math.min(Math.max(lx, ccx), ccx + 1);
                    const closestY = Math.min(Math.max(ly, ccy), ccy + 1);
                    const closestZ = Math.min(Math.max(lz, ccz), ccz + 1);

                    const ddx = lx - closestX, ddy = ly - closestY, ddz = lz - closestZ;
                    const distSq = ddx * ddx + ddy * ddy + ddz * ddz;
                    if (distSq >= COLLISION_RADIUS * COLLISION_RADIUS) continue;

                    moved = true;
                    const dist = Math.sqrt(distSq);
                    if (dist > 0.0001) {
                        const push = COLLISION_RADIUS - dist;
                        lx += (ddx / dist) * push;
                        ly += (ddy / dist) * push;
                        lz += (ddz / dist) * push;
                    } else {
                        ly += COLLISION_RADIUS; // dead centre on a boundary — nudge up
                    }
                }
            }
        }

        return [lx, ly, lz, moved];
    }

    // Exterior hull collision against the voxel grid in shipwreckCollisionCells.js
    // (built offline by build-footprint.mjs from the real model geometry).
    // Mutates positionVec3 in place, called from Player.js.
    //
    // previousPositionVec3 (last frame's already-resolved position) lets a
    // fast-moving frame (boosting — Player.js's inputBoostSpeed is well over
    // a cell/frame at low framerate) sweep for tunnelling: checking only the
    // final landing point missed walls the player's path crossed but didn't
    // stop inside of.
    collide(positionVec3, previousPositionVec3) {
        // The cell data is voxelized from the real model — applying it to
        // the much smaller procedural fallback would block the player on
        // invisible walls sized for a hull that isn't the one rendered.
        if (!this.wreck || !this.isRealModel || this.collisionCells.size === 0) return;

        // World -> the model's local (unrotated, recentred) space.
        const theta = this.wreck.rotation.y;
        const cos = Math.cos(theta), sin = Math.sin(theta);

        const dx = positionVec3[0] - this.wreck.position.x;
        const dy = positionVec3[1] - this.wreck.position.y;
        const dz = positionVec3[2] - this.wreck.position.z;
        let lx = cos * dx - sin * dz;
        let ly = dy;
        let lz = sin * dx + cos * dz;

        const pdx = previousPositionVec3?.[0] - this.wreck.position.x;
        const pdz = previousPositionVec3?.[2] - this.wreck.position.z;
        const plx = previousPositionVec3 ? cos * pdx - sin * pdz : lx;
        const ply = previousPositionVec3 ? previousPositionVec3[1] - this.wreck.position.y : ly;
        const plz = previousPositionVec3 ? sin * pdx + cos * pdz : lz;

        const STEP = COLLISION_RADIUS * 0.5;
        const segLength = Math.hypot(lx - plx, ly - ply, lz - plz);

        if (segLength > STEP) {
            const steps = Math.min(16, Math.ceil(segLength / STEP));

            for (let s = 1; s <= steps; s++) {
                const t = s / steps;
                const sx = plx + (lx - plx) * t;
                const sy = ply + (ly - ply) * t;
                const sz = plz + (lz - plz) * t;
                const [rx, ry, rz, moved] = this.resolvePoint(sx, sy, sz);

                if (moved) {
                    lx = rx; ly = ry; lz = rz;
                    break; // hit a wall along the path — stop advancing further this frame
                }
            }
        } else {
            [lx, ly, lz] = this.resolvePoint(lx, ly, lz);
        }

        // Local -> world.
        positionVec3[0] = this.wreck.position.x + cos * lx + sin * lz;
        positionVec3[1] = this.wreck.position.y + ly;
        positionVec3[2] = this.wreck.position.z - sin * lx + cos * lz;
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
