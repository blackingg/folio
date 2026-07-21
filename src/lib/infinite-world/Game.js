import Debug from "./Debug/Debug.js";
import State from "./State/State.js";
import View from "./View/View.js";
import { WORLD_SEED } from "./worldGen.js";
import { resolveQuality } from "./quality.js";

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
    this.seed = WORLD_SEED;
    this.destroyed = false;

    // Resolved before State/View construct — Viewport, Chunks, Grass,
    // TreeBillboards, Trees, Camera and Sky read this at construction.
    this.quality = resolveQuality();

    // Callbacks for React
    this.onLoadProgress = onLoadProgress || (() => {});
    this.onLoadComplete = onLoadComplete || (() => {});

    this.debug = new Debug();
    this.state = new State();
    this.view = new View();
    
    // Lazy-load modules that require both State and View singletons to exist
    import('./State/AssetManager.js').then(module => {
        this.assetManager = new module.default();
    });
    import('./State/ExperienceManager.js').then(module => {
        this.experienceManager = new module.default();
    });

    // Track loading via chunks
    this._readyChunks = 0;
    this._setupLoading();

    // Append canvas
    if (this.view && this.view.renderer) {
      domElement.appendChild(this.view.renderer.instance.domElement);
    }

    this._resizeHandler = () => this.resize();
    window.addEventListener("resize", this._resizeHandler);

    // setAnimationLoop instead of a recursive rAF: three routes it to
    // window.rAF normally and to XRSession.requestAnimationFrame while a
    // WebXR session is presenting, so one loop serves both modes.
    this.view.renderer.instance.setAnimationLoop(() => this.update());
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
      if (this.state?.controls) {
        this.state.controls.inputEnabled = true;
      }
      this.onLoadComplete();
    }
  }

  update() {
    if (this.destroyed) return;

    this.state.update();
    this.view.update();
  }

  resize() {
    if (this.destroyed) return;
    this.state.resize();
    this.view.resize();
  }

  destroy() {
    this.destroyed = true;

    // The animation loop and XR state live on the globally cached renderer —
    // without this reset the callback would keep ticking a destroyed Game
    // from the next instance's renderer.
    if (this.view?.renderer?.instance) {
      const renderer = this.view.renderer.instance;
      renderer.setAnimationLoop(null);
      renderer.xr.getSession?.()?.end?.();
      renderer.xr.enabled = false;
    }

    window.removeEventListener("resize", this._resizeHandler);

    // Clean up renderer — the WebGLRenderer and its context are cached
    // globally and reused by the next Game instance (see Renderer.setInstance),
    // so never dispose() or forceContextLoss() here: only detach the canvas
    // and free this run's GPU resources.
    if (this.view && this.view.renderer && this.view.renderer.instance) {
      const renderer = this.view.renderer.instance;

      if (this.view.scene) {
        this.view.scene.traverse((obj) => {
          obj.geometry?.dispose?.();
          const materials = Array.isArray(obj.material)
            ? obj.material
            : obj.material
              ? [obj.material]
              : [];
          for (const material of materials) {
            for (const value of Object.values(material)) {
              if (value?.isTexture) value.dispose();
            }
            material.dispose();
          }
        });
      }
      renderer.renderLists.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }

    // Stop the terrain generation worker thread — it is never reused
    // across Game instances and leaks otherwise
    if (this.state?.terrains?.worker) this.state.terrains.worker.terminate();

    if (this.state?.controls) this.state.controls.destroy();
    if (this.state?.gamepad) this.state.gamepad.destroy();

    // Reset singletons
    Game.instance = null;
    if (this.state) State.instance = null;
    if (this.view) View.instance = null;
    if (this.debug) Debug.instance = null;
  }
}
