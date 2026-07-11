import Game from '../Game.js';
import State from '../State/State.js';
import View from '../View/View.js';

/**
 * Base contract for a Pluggable Experience (mini-game or self-contained zone).
 * Extend this class and register it with the ExperienceManager.
 */
export default class Experience {
    constructor(config) {
        this.game = Game.getInstance();
        this.state = State.getInstance();
        this.view = View.getInstance();

        this.config = config;
        // Expected config: { id, position, triggerRadius, preloadRadius, gltfPaths, flattenRadius, targetHeight, overridesControls }

        this.isActive = false;
        this.isLoaded = false;
        this.boundingBoxes = []; // For fake collision (AABB)
    }

    /**
     * Called when the player enters the preload radius.
     * Override to fetch GLTF(s) via AssetManager and add meshes to the scene.
     */
    async load() {
        console.log(`[Experience] Loading: ${this.config.id}`);
        this.isLoaded = true;
    }

    /**
     * Called when the player crosses the trigger radius into the experience.
     */
    onEnter() {
        console.log(`[Experience] Entered: ${this.config.id}`);
        this.isActive = true;
    }

    /**
     * Called every frame while the experience is active.
     */
    update() {
        // Implementation provided by subclasses
    }

    /**
     * Called when the player leaves the trigger radius.
     */
    onExit() {
        console.log(`[Experience] Exited: ${this.config.id}`);
        this.isActive = false;
    }

    /**
     * Called to clean up memory when the player leaves the preload radius.
     */
    dispose() {
        console.log(`[Experience] Disposing: ${this.config.id}`);
        this.isLoaded = false;
        this.boundingBoxes = [];
    }
}
