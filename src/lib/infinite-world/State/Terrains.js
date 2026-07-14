import EventsEmitter from 'events'

import Game from '../Game.js'
import State from './State.js'
import Debug from '../Debug/Debug.js'
// Worker is loaded via new Worker() instead of Vite's ?worker import
import Terrain from './Terrain.js'
import { TERRAIN, computeIterationsOffsets } from '../worldGen.js'

export default class Terrains
{
    static ITERATIONS_FORMULA_MAX = 1
    static ITERATIONS_FORMULA_MIN = 2
    static ITERATIONS_FORMULA_MIX = 3
    static ITERATIONS_FORMULA_POWERMIX = 4

    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.debug = Debug.getInstance()

        this.seed = this.game.seed + 'b'
        this.subdivisions = TERRAIN.subdivisions
        this.lacunarity = TERRAIN.lacunarity
        this.persistence = TERRAIN.persistence
        this.maxIterations = TERRAIN.maxIterations
        this.baseFrequency = TERRAIN.baseFrequency
        this.baseAmplitude = TERRAIN.baseAmplitude
        this.power = TERRAIN.power
        this.elevationOffset = TERRAIN.elevationOffset

        this.segments = this.subdivisions + 1
        this.iterationsFormula = Terrains.ITERATIONS_FORMULA_POWERMIX

        this.lastId = 0
        this.terrains = new Map()

        this.events = new EventsEmitter()
        
        // Iterations offsets
        this.iterationsOffsets = computeIterationsOffsets(this.seed)

        this.setWorkers()
        this.setDebug()
    }

    setWorkers()
    {
        this.worker = new Worker(new URL('../Workers/Terrain.js', import.meta.url))

        this.worker.onmessage = (event) =>
        {
            // console.timeEnd(`terrains: worker (${event.data.id})`)

            const terrain = this.terrains.get(event.data.id)

            if(terrain)
            {
                terrain.create(event.data)
            }
        }
    }

    getIterationsForPrecision(precision)
    {
        if(this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MAX)
            return this.maxIterations

        if(this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MIN)
            return Math.floor((this.maxIterations - 1) * precision) + 1

        if(this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MIX)
            return Math.round((this.maxIterations * precision + this.maxIterations) / 2)

        if(this.iterationsFormula === Terrains.ITERATIONS_FORMULA_POWERMIX)
            return Math.round((this.maxIterations * (precision, 1 - Math.pow(1 - precision, 2)) + this.maxIterations) / 2)
    }

    create(size, x, z, precision)
    {
        // Create id
        const id = this.lastId++

        // Create terrain
        const iterations = this.getIterationsForPrecision(precision)
        const terrain = new Terrain(this, id, size, x, z, precision)
        this.terrains.set(terrain.id, terrain)

        // Extract experiences for terrain flattening
        const experiencesData = [];
        if (this.game.experienceManager) {
            this.game.experienceManager.registry.forEach(exp => {
                experiencesData.push({
                    x: exp.config.position.x,
                    z: exp.config.position.z,
                    radius: exp.config.flattenRadius,
                    targetHeight: exp.config.targetHeight
                });
            });
        }

        // Post to worker
        // console.time(`terrains: worker (${terrain.id})`)
        this.worker.postMessage({
            id: terrain.id,
            x,
            z,
            seed: this.seed,
            precision: precision,
            subdivisions: this.subdivisions,
            size: size,
            lacunarity: this.lacunarity,
            persistence: this.persistence,
            iterations: iterations,
            baseFrequency: this.baseFrequency,
            baseAmplitude: this.baseAmplitude,
            power: this.power,
            elevationOffset: this.elevationOffset,
            iterationsOffsets: this.iterationsOffsets,
            experiences: experiencesData
        })

        this.events.emit('create', terrain)

        return terrain
    }

    destroyTerrain(id)
    {
        const terrain = this.terrains.get(id)

        if(terrain)
        {
            terrain.destroy()
            this.terrains.delete(id)
        }
    }

    recreate()
    {
        for(const [key, terrain] of this.terrains)
        {
            // this.create(terrain.size, terrain.x, terrain.z)
            
            // console.time(`terrains: worker (${terrain.id})`)
            const iterations = this.getIterationsForPrecision(terrain.precision)
            this.worker.postMessage({
                id: terrain.id,
                size: terrain.size,
                x: terrain.x,
                z: terrain.z,
                seed: this.seed,
                precision: terrain.precision,
                subdivisions: this.subdivisions,
                lacunarity: this.lacunarity,
                persistence: this.persistence,
                iterations: iterations,
                baseFrequency: this.baseFrequency,
                baseAmplitude: this.baseAmplitude,
                power: this.power,
                elevationOffset: this.elevationOffset,
                iterationsOffsets: this.iterationsOffsets
            })
        }
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        const folder = this.debug.ui.getFolder('state/terrains')

        folder
            .add(this, 'subdivisions')
            .min(1)
            .max(400)
            .step(1)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'lacunarity')
            .min(1)
            .max(5)
            .step(0.01)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'persistence')
            .min(0)
            .max(1)
            .step(0.01)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'maxIterations')
            .min(1)
            .max(10)
            .step(1)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'baseFrequency')
            .min(0)
            .max(0.01)
            .step(0.0001)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'baseAmplitude')
            .min(0)
            .max(500)
            .step(0.1)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'power')
            .min(1)
            .max(10)
            .step(1)
            .onFinishChange(() => this.recreate())

        folder
            .add(this, 'elevationOffset')
            .min(- 10)
            .max(10)
            .step(1)
            .onFinishChange(() => this.recreate())

        folder
            .add(
                this,
                'iterationsFormula',
                {
                    'max': Terrains.ITERATIONS_FORMULA_MAX,
                    'min': Terrains.ITERATIONS_FORMULA_MIN,
                    'mix': Terrains.ITERATIONS_FORMULA_MIX,
                    'powerMix': Terrains.ITERATIONS_FORMULA_POWERMIX,
                }
            )
            .onFinishChange(() => this.recreate())
            

        // this.material.uniforms.uFresnelOffset.value = 0
        // this.material.uniforms.uFresnelScale.value = 0.5
        // this.material.uniforms.uFresnelPower.value = 2
    }
}