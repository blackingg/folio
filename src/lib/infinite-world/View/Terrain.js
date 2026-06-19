import { BufferAttribute, BufferGeometry, ClampToEdgeWrapping, DataTexture, Float32BufferAttribute, FloatType, LinearFilter, Mesh, MeshNormalMaterial, RGBAFormat, UVMapping } from 'three';

import View from './View.js'
import State from '../State/State.js'

export default class Terrain
{
    constructor(terrains, terrainState)
    {
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.scene = this.view.scene

        this.terrains = terrains
        this.terrainState = terrainState
        this.terrainState.renderInstance = this

        this.created = false

        this.terrainState.events.on('ready', () =>
        {
            this.create()
        })
    }

    create()
    {
        const terrainsState = this.state.terrains

        // Recreate
        if(this.created)
        {
            // Dispose of old geometry
            this.geometry.dispose()

            // Create new geometry
            this.geometry = new BufferGeometry()
            this.geometry.setAttribute('position', new BufferAttribute(this.terrainState.positions, 3))
            this.geometry.index = new BufferAttribute(this.terrainState.indices, 1, false)
        
            this.mesh.geometry = this.geometry
        }

        // Create
        else
        {
            // Create geometry
            this.geometry = new BufferGeometry()
            this.geometry.setAttribute('position', new Float32BufferAttribute(this.terrainState.positions, 3))
            this.geometry.setAttribute('uv', new Float32BufferAttribute(this.terrainState.uv, 2))
            this.geometry.index = new BufferAttribute(this.terrainState.indices, 1, false)

            // Texture
            this.texture = new DataTexture(
                this.terrainState.texture,
                terrainsState.segments,
                terrainsState.segments,
                RGBAFormat,
                FloatType,
                UVMapping,
                ClampToEdgeWrapping,
                ClampToEdgeWrapping,
                LinearFilter,
                LinearFilter
            )
            this.texture.flipY = false
            this.texture.needsUpdate = true

            // // Material
            // this.material = this.terrains.material.clone()
            // this.material.uniforms.uTexture.value = this.texture

            // Create mesh
            this.mesh = new Mesh(this.geometry, this.terrains.material)
            this.mesh.userData.texture = this.texture
            // this.mesh = new Mesh(this.geometry, new MeshNormalMaterial())
            this.scene.add(this.mesh)
            
            this.created = true
        }
    }

    update()
    {

    }

    destroy()
    {
        if(this.created)
        {
            this.geometry.dispose()
            this.scene.remove(this.mesh)
        }
    }
}