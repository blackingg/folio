import Experience from './Experience.js';

export default class Basketball extends Experience {
    constructor(config) {
        super(config);
    }

    async load() {
        await super.load();
        // AssetManager loading logic goes here once GLTFs are ready
    }

    onEnter() {
        super.onEnter();
        // Show basketball HUD / instructions
    }

    update(dt) {
        super.update(dt);
        // Charge shot logic goes here
    }

    onExit() {
        super.onExit();
        // Hide HUD
    }
}
