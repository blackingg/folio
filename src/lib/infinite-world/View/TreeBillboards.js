import { BufferGeometry, Float32BufferAttribute, Mesh, Vector2, Vector3 } from 'three';

import Game from '../Game.js'
import View from './View.js'
import State from '../State/State.js'
import TreeBillboardMaterial from './Materials/TreeBillboardMaterial.js'

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    return (hash >>> 0) / 4294967296.0;
}

export default class TreeBillboards
{
    constructor()
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()

        this.time = this.state.time
        this.scene = this.view.scene

        // Grid parameters — modelled after Grass.js
        this.details = 150             // 150x150 grid = 22,500 instances
        this.size = 2500               // Covers a 2500x2500 world-unit area
        this.count = this.details * this.details
        this.fragmentSize = this.size / this.details

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        // Each instance is a single quad (two triangles).
        // The vertex shader handles billboarding and scaling.
        // We use an attribute `instanceCenter` per-vertex to know where each instance sits.
        const instanceCenters = new Float32Array(this.count * 3 * 2) // 3 verts × 2 floats
        const positions = new Float32Array(this.count * 3 * 3)       // 3 verts × 3 floats

        // Actually, let's use 12 verts per instance (4 triangles = 2 quads)
        // 1 quad for the tree billboard, 1 quad for the shadow decal
        const totalVerts = this.count * 12
        const centersArr = new Float32Array(totalVerts * 2)
        const positionsArr = new Float32Array(totalVerts * 3)
        const uvsArr = new Float32Array(totalVerts * 2) 
        const typeArr = new Float32Array(totalVerts) // 1.0 = billboard, 0.0 = shadow

        for (let iX = 0; iX < this.details; iX++)
        {
            const fragmentX = (iX / this.details - 0.5) * this.size + this.fragmentSize * 0.5

            for (let iZ = 0; iZ < this.details; iZ++)
            {
                const fragmentZ = (iZ / this.details - 0.5) * this.size + this.fragmentSize * 0.5

                const instanceIndex = iX * this.details + iZ
                const vStride = instanceIndex * 12

                // Add slight random offset to break the grid pattern
                const r1 = Math.random() - 0.5
                const r2 = Math.random() - 0.5
                const centerX = fragmentX + r1 * this.fragmentSize * 0.8
                const centerZ = fragmentZ + r2 * this.fragmentSize * 0.8

                // Billboard Quad (UV y=1 indicates this is the upright billboard)
                const billboardVerts = [
                    [-0.5, 0.0, 0.0],
                    [ 0.5, 0.0, 0.0],
                    [ 0.5, 1.0, 0.0],
                    [-0.5, 0.0, 0.0],
                    [ 0.5, 1.0, 0.0],
                    [-0.5, 1.0, 0.0],
                ]

                // Shadow Quad (UV y=0 indicates this is the flat shadow)
                const shadowVerts = [
                    [-0.5, 0.0, -0.5],
                    [ 0.5, 0.0, -0.5],
                    [ 0.5, 0.0,  0.5],
                    [-0.5, 0.0, -0.5],
                    [ 0.5, 0.0,  0.5],
                    [-0.5, 0.0,  0.5],
                ]

                for (let v = 0; v < 6; v++)
                {
                    const viBillboard = vStride + v
                    centersArr[viBillboard * 2    ] = centerX
                    centersArr[viBillboard * 2 + 1] = centerZ
                    positionsArr[viBillboard * 3    ] = billboardVerts[v][0]
                    positionsArr[viBillboard * 3 + 1] = billboardVerts[v][1]
                    positionsArr[viBillboard * 3 + 2] = billboardVerts[v][2]
                    uvsArr[viBillboard * 2    ] = billboardVerts[v][0] + 0.5 // u = 0 to 1
                    uvsArr[viBillboard * 2 + 1] = billboardVerts[v][1]       // v = 0 to 1
                    typeArr[viBillboard] = 1.0

                    const viShadow = vStride + 6 + v
                    centersArr[viShadow * 2    ] = centerX
                    centersArr[viShadow * 2 + 1] = centerZ
                    positionsArr[viShadow * 3    ] = shadowVerts[v][0]
                    positionsArr[viShadow * 3 + 1] = shadowVerts[v][1]
                    positionsArr[viShadow * 3 + 2] = shadowVerts[v][2]
                    uvsArr[viShadow * 2    ] = shadowVerts[v][0] + 0.5 // u = 0 to 1
                    uvsArr[viShadow * 2 + 1] = shadowVerts[v][2] + 0.5 // v = 0 to 1
                    typeArr[viShadow] = 0.0
                }
            }
        }

        this.geometry = new BufferGeometry()
        this.geometry.setAttribute('instanceCenter', new Float32BufferAttribute(centersArr, 2))
        this.geometry.setAttribute('position', new Float32BufferAttribute(positionsArr, 3))
        this.geometry.setAttribute('uv', new Float32BufferAttribute(uvsArr, 2))
        this.geometry.setAttribute('aType', new Float32BufferAttribute(typeArr, 1))
    }

    setMaterial()
    {
        const engineChunks = this.state.chunks
        const engineTerrains = this.state.terrains

        this.material = new TreeBillboardMaterial()
        this.material.uniforms.uPlayerPosition.value = new Vector3()
        this.material.uniforms.uGridSize.value = this.size
        this.material.uniforms.uSunPosition.value = new Vector3(-0.5, -0.5, -0.5)
        this.material.uniforms.uFogTexture.value = this.view.sky.customRender.texture

        const globalSeed = this.game.seed + 'b'
        this.material.uniforms.uSeed_t.value = hashString(globalSeed + '_t') * 100.0
        this.material.uniforms.uSeed_b.value = hashString(globalSeed + '_b') * 100.0
        this.material.uniforms.uOffset.value = new Vector2(
            engineTerrains.iterationsOffsets[0][0],
            engineTerrains.iterationsOffsets[0][1]
        )

        this.material.uniforms.uTerrainSize.value = engineChunks.minSize
        this.material.uniforms.uTerrainTextureSize.value = engineTerrains.segments
        this.material.uniforms.uTerrainATexture.value = null
        this.material.uniforms.uTerrainAOffset.value = new Vector2()
        this.material.uniforms.uTerrainBTexture.value = null
        this.material.uniforms.uTerrainBOffset.value = new Vector2()
        this.material.uniforms.uTerrainCTexture.value = null
        this.material.uniforms.uTerrainCOffset.value = new Vector2()
        this.material.uniforms.uTerrainDTexture.value = null
        this.material.uniforms.uTerrainDOffset.value = new Vector2()
    }

    setMesh()
    {
        this.mesh = new Mesh(
            this.geometry,
            this.material
        )
        this.mesh.frustumCulled = false
        this.scene.add(this.mesh)
    }

    update()
    {
        const playerState = this.state.player
        const playerPosition = playerState.position.current
        const engineChunks = this.state.chunks
        const sunState = this.state.sun
        const dayState = this.state.day

        this.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
        this.material.uniforms.uDayCycleProgress.value = dayState.progress

        this.mesh.position.set(playerPosition[0], 0, playerPosition[2])
        this.material.uniforms.uPlayerPosition.value.set(playerPosition[0], playerPosition[1], playerPosition[2])

        // Get terrain data (same pattern as Grass.js)
        const aChunkState = engineChunks.getDeepestChunkForPosition(playerPosition[0], playerPosition[2])

        if (aChunkState && aChunkState.terrain && aChunkState.terrain.renderInstance && aChunkState.terrain.renderInstance.texture)
        {
            // Texture A
            this.material.uniforms.uTerrainATexture.value = aChunkState.terrain.renderInstance.texture
            this.material.uniforms.uTerrainAOffset.value.set(
                aChunkState.x - aChunkState.size * 0.5,
                aChunkState.z - aChunkState.size * 0.5
            )

            const chunkPositionRatioX = (playerPosition[0] - aChunkState.x + aChunkState.size * 0.5) / aChunkState.size
            const chunkPositionRatioZ = (playerPosition[2] - aChunkState.z + aChunkState.size * 0.5) / aChunkState.size

            // Texture B
            const bChunkState = aChunkState.neighbours.get(chunkPositionRatioX < 0.5 ? 'w' : 'e')

            if (bChunkState && bChunkState.terrain && bChunkState.terrain.renderInstance && bChunkState.terrain.renderInstance.texture)
            {
                this.material.uniforms.uTerrainBTexture.value = bChunkState.terrain.renderInstance.texture
                this.material.uniforms.uTerrainBOffset.value.set(
                    bChunkState.x - bChunkState.size * 0.5,
                    bChunkState.z - bChunkState.size * 0.5
                )
            }

            // Texture C
            const cChunkState = aChunkState.neighbours.get(chunkPositionRatioZ < 0.5 ? 'n' : 's')

            if (cChunkState && cChunkState.terrain && cChunkState.terrain.renderInstance && cChunkState.terrain.renderInstance.texture)
            {
                this.material.uniforms.uTerrainCTexture.value = cChunkState.terrain.renderInstance.texture
                this.material.uniforms.uTerrainCOffset.value.set(
                    cChunkState.x - cChunkState.size * 0.5,
                    cChunkState.z - cChunkState.size * 0.5
                )
            }

            // Texture D
            if (bChunkState) {
                const dChunkState = bChunkState.neighbours.get(chunkPositionRatioZ < 0.5 ? 'n' : 's')

                if (dChunkState && dChunkState.terrain && dChunkState.terrain.renderInstance && dChunkState.terrain.renderInstance.texture)
                {
                    this.material.uniforms.uTerrainDTexture.value = dChunkState.terrain.renderInstance.texture
                    this.material.uniforms.uTerrainDOffset.value.set(
                        dChunkState.x - dChunkState.size * 0.5,
                        dChunkState.z - dChunkState.size * 0.5
                    )
                }
            }
        }
    }
}
