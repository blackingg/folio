import Debug from "./Debug/Debug.js";
import State from "./State/State.js";
import View from "./View/View.js";

export default class Game {
  static instance;

  static getInstance() {
    return Game.instance;
  }

  constructor(domElement, onLoadProgress, onLoadComplete) {
    if (Game.instance) {
      Game.instance.destroy();
      Game.instance = null;
    }

    Game.instance = this;

    this.domElement = domElement;
    this.seed = "p";
    this.destroyed = false;
    this.animationFrameId = null;

    // Callbacks for React
    this.onLoadProgress = onLoadProgress || (() => {});
    this.onLoadComplete = onLoadComplete || (() => {});

    this.debug = new Debug();
    this.state = new State();
    this.view = new View();

    // Track loading via chunks
    this._readyChunks = 0;
    this._setupLoading();

    // Append canvas
    if (this.view && this.view.renderer) {
      domElement.appendChild(this.view.renderer.instance.domElement);
    }

    this._resizeHandler = () => this.resize();
    window.addEventListener("resize", this._resizeHandler);

    this.update();
  }

  _setupLoading() {
    const chunks = this.state.chunks;

    // Handle existing chunks
    for (const [key, chunk] of chunks.mainChunks) {
      this._handleChunk(chunk);
    }

    // Listen for new chunks
    chunks.events.on("create", (chunk) => {
      this._handleChunk(chunk);
    });
  }

  _handleChunk(chunk) {
    if (!chunk.parent) {
      if (chunk.ready) {
        this._readyChunks++;
        this._checkLoaded();
      } else {
        chunk.events.once("ready", () => {
          this._readyChunks++;
          this.onLoadProgress(Math.round((this._readyChunks / 9) * 100));
          this._checkLoaded();
        });
      }
    }
  }

  _checkLoaded() {
    if (this._readyChunks >= 9) {
      this.onLoadComplete();
    }
  }

  update() {
    if (this.destroyed) return;

    this.state.update();
    this.view.update();

    this.animationFrameId = window.requestAnimationFrame(() => {
      this.update();
    });
  }

  resize() {
    if (this.destroyed) return;
    this.state.resize();
    this.view.resize();
  }

  destroy() {
    this.destroyed = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener("resize", this._resizeHandler);

    // Clean up renderer
    if (this.view && this.view.renderer && this.view.renderer.instance) {
      this.view.renderer.instance.dispose();
      if (this.view.renderer.instance.domElement.parentNode) {
        this.view.renderer.instance.domElement.parentNode.removeChild(
          this.view.renderer.instance.domElement
        );
      }
    }

    // Reset singletons
    Game.instance = null;
    if (this.state) State.instance = null;
    if (this.view) View.instance = null;
    if (this.debug) Debug.instance = null;
  }
}
