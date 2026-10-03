import * as THREE from 'three';
import Game from '../Game.js';
import State from './State.js';
import View from '../View/View.js';
import Basketball from '../experiences/Basketball.js';
import Village from '../experiences/Village.js';
import GodsPalm from '../experiences/GodsPalm.js';
import { EXPERIENCES } from '../worldGen.js';

const EXPERIENCE_CLASSES = {
    basketball_court: Basketball,
    village: Village,
    gods_palm: GodsPalm,
};

let instance = null;

export default class ExperienceManager {
    constructor() {
        if (instance) return instance;
        instance = this;

        this.game = Game.getInstance();
        this.state = State.getInstance();
        this.view = View.getInstance();

        this.activeExperience = null;
        
        // Setup registry from the shared world definitions (worldGen.js)
        this.registry = EXPERIENCES.map((def) => {
            const ExperienceClass = EXPERIENCE_CLASSES[def.id];
            return new ExperienceClass({
                id: def.id,
                position: new THREE.Vector3(def.x, 0, def.z),
                triggerRadius: def.triggerRadius,
                preloadRadius: def.preloadRadius,
                flattenRadius: def.flattenRadius,
                targetHeight: def.targetHeight,
                floatRadius: def.floatRadius,
                gltfPaths: def.gltfPaths,
                loadingOrb: def.loadingOrb !== false, // opt-out; heavy zones keep the mist orb
                overridesControls: false
            });
        });

        this.markers = new Map();
        
        // Wait for scene to be ready before adding markers
        setTimeout(() => {
            this.initMarkers();
        }, 100);
    }

    static getInstance() {
        if (!instance) return new ExperienceManager();
        return instance;
    }

    initMarkers() {
        const scene = this.view.scene;
        
        this.registry.forEach(exp => {
            if (!exp.config.loadingOrb) return;

            const markerGroup = new THREE.Group();
            
            // thetaLength is stretched past Math.PI / 2 to extend the dome down into the terrain
            const domeGeo = new THREE.SphereGeometry(
                exp.config.triggerRadius,
                32, 16,
                0, Math.PI * 2,
                0, Math.PI * 0.65
            );
            
            // Unlit — the scene has no standard three.js lights (everything is
            // shaded by custom sun-based materials), so a lit material would
            // render black. Basic material reads as a veil of mist instead.
            const domeMat = new THREE.MeshBasicMaterial({
                color: 0xdfe8f2, // pale mist
                transparent: true,
                opacity: 0.98,
                side: THREE.DoubleSide,
                depthWrite: true
            });
            
            const dome = new THREE.Mesh(domeGeo, domeMat);
            dome.name = 'dome';
            
            markerGroup.add(dome);
            markerGroup.position.copy(exp.config.position);
            
            scene.add(markerGroup);
            this.markers.set(exp.config.id, markerGroup);
        });
    }

    checkZones(playerPosition) {
        // Adjust markers to terrain height & update dome fading based on proximity
        this.registry.forEach(exp => {
            const marker = this.markers.get(exp.config.id);
            if (marker) {
                if (this.state.chunks) {
                    const elevation = this.state.chunks.getElevationForPosition(exp.config.position.x, exp.config.position.z);
                    // Not-ready terrain returns undefined, missing chunks false
                    if (typeof elevation === 'number' && Number.isFinite(elevation)) {
                        marker.position.y = elevation;
                    }
                }

                // Smoothly fade out dome as player approaches the trigger radius
                const dome = marker.getObjectByName('dome');
                if (dome) {
                    const dx = playerPosition[0] - exp.config.position.x;
                    const dz = playerPosition[2] - exp.config.position.z;
                    const dist = Math.hypot(dx, dz);
                    
                    const triggerR = exp.config.triggerRadius;
                    const fadeStart = triggerR + 20; // begin fading out 20 units before entering
                    
                    if (dist < triggerR) {
                        dome.visible = false;
                        dome.material.opacity = 0;
                    } else if (dist < fadeStart) {
                        dome.visible = true;
                        // Linear interpolation between 0 (at triggerRadius) and 0.98 (at fadeStart)
                        const t = (dist - triggerR) / (fadeStart - triggerR);
                        dome.material.opacity = t * 0.98;
                    } else {
                        dome.visible = true;
                        dome.material.opacity = 0.98;
                    }
                }
            }
        });

        // Check active distances
        this.registry.forEach(exp => {
            const dx = playerPosition[0] - exp.config.position.x;
            const dz = playerPosition[2] - exp.config.position.z;
            const dist = Math.hypot(dx, dz);

            // Preload boundary
            if (dist < exp.config.preloadRadius) {
                if (!exp.isLoaded) {
                    exp.load();
                }
            }

            // Trigger boundary
            if (dist < exp.config.triggerRadius) {
                if (!exp.isActive) {
                    if (this.activeExperience && this.activeExperience !== exp) {
                        this.activeExperience.onExit();
                    }
                    exp.onEnter();
                    this.activeExperience = exp;
                }
            } else if (exp.isActive) {
                exp.onExit();
                if (this.activeExperience === exp) {
                    this.activeExperience = null;
                }
            }
            
            // Dispose boundary (e.g. preloadRadius + margin)
            if (dist > exp.config.preloadRadius * 1.5) {
                if (exp.isLoaded) {
                    exp.dispose();
                }
            }
        });

        // Ambient per-frame hook for every loaded experience, active or not
        this.registry.forEach(exp => {
            if (exp.isLoaded) {
                exp.passiveUpdate(this.state.time.delta);
            }
        });

        if (this.activeExperience) {
            this.activeExperience.update(this.state.time.delta);
        }
    }
}
