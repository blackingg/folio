import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Game from '../Game.js';
import { convertSceneToUnlit, recenterOnFloor } from '../View/Materials/unlitGLTF.js';

let instance = null;

export default class AssetManager {
    constructor() {
        if (instance) return instance;
        instance = this;

        this.game = Game.getInstance();
        this.gltfLoader = new GLTFLoader();
        
        // Cache loaded assets
        this.cache = new Map();
    }

    static getInstance() {
        if (!instance) return new AssetManager();
        return instance;
    }

    /**
     * Load a GLTF model.
     * @param {string} path - URL to the GLTF/GLB file
     * @returns {Promise<any>} - Resolves with the loaded GLTF scene
     */
    async loadModel(path) {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    this.cache.set(path, gltf);
                    resolve(gltf);
                },
                (xhr) => {
                    // Optional: Bridge loading progress to HUD
                    if (this.game.onLoadProgress) {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        // Avoid triggering 100% too early and hiding the screen before scene compiles
                        if (percent < 100) this.game.onLoadProgress(percent);
                    }
                },
                (error) => {
                    console.error(`[AssetManager] Failed to load ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load a GLTF for use as a plain static prop: unlit-converted (see
     * unlitGLTF.js — this scene has no real lights, so a lit GLTF renders
     * black untouched) and recentred on its own floor by default. Clones
     * the cached scene each call so multiple placements of the same asset
     * don't fight over one shared Object3D (an Object3D can only have one
     * parent) or step on each other's material instances.
     *
     * For anything that needs per-instance shading (fog, sun-tinting,
     * thousands of instances) use loadModel() directly and build the
     * material yourself — see Trees.js, which shares toUnlitMaterial() as
     * its base but layers custom shader injection on top.
     */
    async loadUnlitModel(path, { recenter = true } = {}) {
        const gltf = await this.loadModel(path);
        const scene = gltf.scene.clone(true);

        convertSceneToUnlit(scene);
        if (recenter) recenterOnFloor(scene);

        return scene;
    }
}
