import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Game from '../Game.js';

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
}
