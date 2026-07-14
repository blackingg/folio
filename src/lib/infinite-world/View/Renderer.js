import { PCFSoftShadowMap, ReinhardToneMapping, WebGLRenderer, sRGBEncoding } from 'three';

import Game from '../Game.js'
import View from './View.js'
import Debug from '../Debug/Debug.js'
import State from '../State/State.js'

export default class Renderer
{
    constructor(_options = {})
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()
        this.debug = Debug.getInstance()

        this.scene = this.view.scene
        this.domElement = this.game.domElement
        this.viewport = this.state.viewport
        this.time = this.state.time
        this.camera = this.view.camera

        this.setInstance()
    }

    setInstance()
    {
        this.clearColor = '#222222'

        // Reuse a single WebGLRenderer (and its WebGL context) across Game
        // instances — dev hot-reloads and route remounts otherwise churn real
        // contexts, which both exhausts the browser's context cap and can trip
        // Chrome's "page caused context loss" blocking.
        const cached = globalThis.__infiniteWorldRenderer
        if (cached && !cached.getContext().isContextLost()) {
            this.instance = cached
        } else {
            try {
                this.instance = new WebGLRenderer({
                    alpha: false,
                    antialias: true
                })
            } catch (error) {
                // Marginal GPUs / software rasterizers sometimes refuse an
                // antialiased context — retry with the cheapest settings
                // before giving up (throws again if truly unavailable).
                console.warn('[Renderer] Antialiased context failed, retrying without:', error)
                this.instance = new WebGLRenderer({
                    alpha: false,
                    antialias: false,
                    powerPreference: 'low-power',
                    failIfMajorPerformanceCaveat: false
                })
            }
            globalThis.__infiniteWorldRenderer = this.instance
        }

        this.instance.sortObjects = false
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        // this.instance.setClearColor(0x414141, 1)
        this.instance.setClearColor(this.clearColor, 1)
        this.instance.setSize(this.viewport.width, this.viewport.height)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        // this.instance.physicallyCorrectLights = true
        // this.instance.gammaOutPut = true
        // this.instance.outputEncoding = sRGBEncoding
        // this.instance.shadowMap.type = PCFSoftShadowMap
        // this.instance.shadowMap.enabled = false
        // this.instance.toneMapping = ReinhardToneMapping
        // this.instance.toneMapping = ReinhardToneMapping
        // this.instance.toneMappingExposure = 1.3

        this.context = this.instance.getContext()

        // Add stats panel
        if(this.debug.stats)
        {
            this.debug.stats.setRenderPanel(this.context)
        }
    }

    resize()
    {
        // Instance
        this.instance.setSize(this.viewport.width, this.viewport.height)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)
    }

    update()
    {
        if(this.debug.stats)
            this.debug.stats.beforeRender()

        this.instance.render(this.scene, this.camera.instance)

        if(this.debug.stats)
            this.debug.stats.afterRender()
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.renderTarget.dispose()
    }
}