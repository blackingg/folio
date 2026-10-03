import Experience from './Experience.js';

export default class Village extends Experience {
    constructor(config) {
        super(config);
    }

    async load() {
        await super.load();
        // AssetManager loading logic goes here once GLTFs are ready
    }

    onEnter() {
        super.onEnter();
        // Show Village HUD / toggle ambient audio
    }

    update(dt) {
        super.update(dt);
    }

    onExit() {
        super.onExit();
    }
}
