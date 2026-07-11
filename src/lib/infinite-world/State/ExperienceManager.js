import * as THREE from 'three';
import Game from '../Game.js';
import State from './State.js';
import View from '../View/View.js';
import Basketball from '../experiences/Basketball.js';
import Village from '../experiences/Village.js';

let instance = null;

export default class ExperienceManager {
    constructor() {
        if (instance) return instance;
        instance = this;

        this.game = Game.getInstance();
        this.state = State.getInstance();
        this.view = View.getInstance();

        this.activeExperience = null;
        
        // Setup registry
        this.registry = [
            new Basketball({
                id: 'basketball_court',
                position: new THREE.Vector3(150, 0, 150), // Sample location
                triggerRadius: 20,
                preloadRadius: 100,
                flattenRadius: 30,
                targetHeight: 5,
                gltfPaths: ['/models/court.glb'],
                overridesControls: false
            }),
            new Village({
                id: 'village',
                position: new THREE.Vector3(-200, 0, -200), // Sample location
                triggerRadius: 40,
                preloadRadius: 150,
                flattenRadius: 60,
                targetHeight: 12,
                gltfPaths: ['/models/village.glb'],
                overridesControls: false
            })
        ];

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
            const markerGroup = new THREE.Group();
            
            // Ground Ring
            const ringGeo = new THREE.RingGeometry(exp.config.preloadRadius - 1, exp.config.preloadRadius, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            
            // Marker Orb
            const orbGeo = new THREE.SphereGeometry(2, 16, 16);
            const orbMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, wireframe: true });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.y = 2; // hover slightly above ground
            
            markerGroup.add(ring);
            markerGroup.add(orb);
            
            markerGroup.position.copy(exp.config.position);
            
            scene.add(markerGroup);
            this.markers.set(exp.config.id, markerGroup);
        });
    }

    checkZones(playerPosition) {
        // Adjust markers to terrain height
        this.registry.forEach(exp => {
            const marker = this.markers.get(exp.config.id);
            if (marker && this.state.chunks) {
                const elevation = this.state.chunks.getElevationForPosition(exp.config.position.x, exp.config.position.z);
                if (elevation !== false) {
                    marker.position.y = elevation;
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

        if (this.activeExperience) {
            this.activeExperience.update(this.state.time.delta);
        }
    }
}
