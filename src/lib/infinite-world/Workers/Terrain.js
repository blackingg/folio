import SimplexNoise from './SimplexNoise.js'
import { vec3 } from 'gl-matrix'
import { snoise3D } from './glslSimplex.js'
import {
    getElevation as computeElevation,
    createBorder,
    BORDER,
    EXPERIENCES,
    hashString,
    linearStep,
} from '../worldGen.js'

let elevationRandom = null

// Thin wrapper binding the shared canonical formula (worldGen.js) to this
// worker's message-supplied params and seeded noise instance.
const getElevation = (x, y, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets, experiences) =>
    computeElevation(
        x,
        y,
        (nx, ny) => elevationRandom.noise2D(nx, ny),
        iterationsOffsets,
        { lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset },
        experiences
    )

onmessage = function(event)
{
    const id = event.data.id
    const size = event.data.size
    const baseX = event.data.x
    const baseZ = event.data.z
    const seed = event.data.seed
    const precision = event.data.precision
    const subdivisions = event.data.subdivisions
    const lacunarity = event.data.lacunarity
    const persistence = event.data.persistence
    const iterations = event.data.iterations
    const baseFrequency = event.data.baseFrequency
    const baseAmplitude = event.data.baseAmplitude
    const power = event.data.power
    const elevationOffset = event.data.elevationOffset
    const iterationsOffsets = event.data.iterationsOffsets
    const experiences = event.data.experiences
    
    const segments = subdivisions + 1
    elevationRandom = new SimplexNoise(seed)
    const grassRandom = new SimplexNoise(seed)

    /**
     * Elevation
     */
    const overflowElevations = new Float32Array((segments + 1) * (segments + 1)) // Bigger to calculate normals more accurately
    const elevations = new Float32Array(segments * segments)
    
    for(let iX = 0; iX < segments + 1; iX++)
    {
        const x = baseX + (iX / subdivisions - 0.5) * size

        for(let iZ = 0; iZ < segments + 1; iZ++)
        {
            const z = baseZ + (iZ / subdivisions - 0.5) * size
            const elevation = getElevation(x, z, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets, experiences)

            const i = iZ * (segments + 1) + iX
            overflowElevations[i] = elevation

            if(iX < segments && iZ < segments)
            {
                const i = iZ * segments + iX
                elevations[i] = elevation
            }
        }
    }

    /**
     * Positions
     */
    const skirtCount = subdivisions * 4 + 4
    const positions = new Float32Array(segments * segments * 3 + skirtCount * 3)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        const z = baseZ + (iZ / subdivisions - 0.5) * size
        for(let iX = 0; iX < segments; iX++)
        {
            const x = baseX + (iX / subdivisions - 0.5) * size

            const elevation = elevations[iZ * segments + iX]

            const iStride = (iZ * segments + iX) * 3
            positions[iStride    ] = x
            positions[iStride + 1] = elevation
            positions[iStride + 2] = z
        }
    }
    
    /**
     * Normals
     */
    const normals = new Float32Array(segments * segments * 3 + skirtCount * 3)
    
    const interSegmentX = - size / subdivisions
    const interSegmentZ = - size / subdivisions

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            // Indexes
            const iOverflowStride = iZ * (segments + 1) + iX

            // Elevations
            const currentElevation = overflowElevations[iOverflowStride]
            const neighbourXElevation = overflowElevations[iOverflowStride + 1]
            const neighbourZElevation = overflowElevations[iOverflowStride + segments + 1]

            // Deltas
            const deltaX = vec3.fromValues(
                interSegmentX,
                currentElevation - neighbourXElevation,
                0
            )

            const deltaZ = vec3.fromValues(
                0,
                currentElevation - neighbourZElevation,
                interSegmentZ
            )

            // Normal
            const normal = vec3.create()
            vec3.cross(normal, deltaZ, deltaX)
            vec3.normalize(normal, normal)

            const iStride = (iZ * segments + iX) * 3
            normals[iStride    ] = normal[0]
            normals[iStride + 1] = normal[1]
            normals[iStride + 2] = normal[2]
        }
    }

    /**
     * UV
     */
    const uv = new Float32Array(segments * segments * 2 + skirtCount * 2)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            const iStride = (iZ * segments + iX) * 2
            uv[iStride    ] = iX / (segments - 1)
            uv[iStride + 1] = iZ / (segments - 1)
        }
    }

    /**
     * Indices
     */
    const indicesCount = subdivisions * subdivisions
    const indices = new (indicesCount < 65535 ? Uint16Array : Uint32Array)(indicesCount * 6 + subdivisions * 4 * 6 * 4)
    
    for(let iZ = 0; iZ < subdivisions; iZ++)
    {
        for(let iX = 0; iX < subdivisions; iX++)
        {
            const row = subdivisions + 1
            const a = iZ * row + iX
            const b = iZ * row + (iX + 1)
            const c = (iZ + 1) * row + iX
            const d = (iZ + 1) * row + (iX + 1)

            const iStride = (iZ * subdivisions + iX) * 6
            indices[iStride    ] = a
            indices[iStride + 1] = d
            indices[iStride + 2] = b

            indices[iStride + 3] = d
            indices[iStride + 4] = a
            indices[iStride + 5] = c
        }
    }
    
    /**
     * Skirt
     */
    let skirtIndex = segments * segments
    let indicesSkirtIndex = segments * segments

    // North (negative Z)
    for(let iX = 0; iX < segments; iX++)
    {
        const iZ = 0
        const iPosition = iZ * segments + iX
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iX < segments - 1)
        {
            const a = iPosition
            const b = iPosition + 1
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = b
            indices[iIndexStride + 1] = d
            indices[iIndexStride + 2] = a

            indices[iIndexStride + 3] = c
            indices[iIndexStride + 4] = a
            indices[iIndexStride + 5] = d

            indicesSkirtIndex++
        }

        skirtIndex++
    }
    
    // South (positive Z)
    for(let iX = 0; iX < segments; iX++)
    {
        const iZ = segments - 1
        const iPosition = iZ * segments + iX
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iX < segments - 1)
        {
            const a = iPosition
            const b = iPosition + 1
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = a
            indices[iIndexStride + 1] = c
            indices[iIndexStride + 2] = b

            indices[iIndexStride + 3] = d
            indices[iIndexStride + 4] = b
            indices[iIndexStride + 5] = c

            indicesSkirtIndex++
        }
        
        skirtIndex++
    }

    // West (negative X)
    for(let iZ = 0; iZ < segments; iZ++)
    {
        const iX = 0
        const iPosition = (iZ * segments + iX)
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX

        // Index
        if(iZ < segments - 1)
        {
            const a = iPosition
            const b = iPosition + segments
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = a
            indices[iIndexStride + 1] = c
            indices[iIndexStride + 2] = b

            indices[iIndexStride + 3] = d
            indices[iIndexStride + 4] = b
            indices[iIndexStride + 5] = c

            indicesSkirtIndex++
        }

        skirtIndex++
    }

    for(let iZ = 0; iZ < segments; iZ++)
    {
        const iX = segments - 1
        const iPosition = (iZ * segments + iX)
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iZ < segments - 1)
        {
            const a = iPosition
            const b = iPosition + segments
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = b
            indices[iIndexStride + 1] = d
            indices[iIndexStride + 2] = a

            indices[iIndexStride + 3] = c
            indices[iIndexStride + 4] = a
            indices[iIndexStride + 5] = d

            indicesSkirtIndex++
        }

        skirtIndex++
    }

    /**
     * Texture
     */
    const texture = new Float32Array(segments * segments * 4)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            const iPositionStride = (iZ * segments + iX) * 3
            const position = vec3.fromValues(
                positions[iPositionStride    ],
                positions[iPositionStride + 1],
                positions[iPositionStride + 2]
            )

            // Normal
            const iNormalStride = (iZ * segments + iX) * 3
            const normal = vec3.fromValues(
                normals[iNormalStride    ],
                normals[iNormalStride + 1],
                normals[iNormalStride + 2]
            )

            // Grass
            const upward = Math.max(0, normal[1])
            let grass = 0;

            if(position[1] > 0)
            {
                const grassFrequency = 0.05
                let grassNoise = grassRandom.noise2D(position[0] * grassFrequency + iterationsOffsets[0][0], position[2] * grassFrequency + iterationsOffsets[0][0])
                grassNoise = linearStep(- 0.5, 0, grassNoise);
                
                const grassUpward = linearStep(0.9, 1, upward);
                
                grass = grassNoise * grassUpward
            }

            // Final texture
            const iTextureStride = (iZ * segments  + iX) * 4
            texture[iTextureStride    ] = normals[iNormalStride    ]
            texture[iTextureStride + 1] = normals[iNormalStride + 1]
            texture[iTextureStride + 2] = normals[iNormalStride + 2]
            texture[iTextureStride + 3] = position[1]
        }
    }

    /**
     * Trees
     */
    const trees = []

    // Shared by every tree emitter below
    const pseudoRandom = (x, z) => {
        let n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
        return n - Math.floor(n)
    }

    // World border — shared formula from worldGen.js (coastline wall of
    // blue trees with a single gate due north)
    const border = createBorder(seed)
    const borderRadiusAt = border.radiusAt
    const gateDistanceAt = border.gateArcDistance
    const BORDER_CLEAR_BAND = BORDER.clearBand
    const GATE_WIDTH = BORDER.gateWidth
    const GATE_CORRIDOR = BORDER.gateCorridor

    const chunkMinX = baseX - size * 0.5
    const chunkMaxX = baseX + size * 0.5
    const chunkMinZ = baseZ - size * 0.5
    const chunkMaxZ = baseZ + size * 0.5

    // Random forest trees — only on high-precision (nearby) chunks
    if (precision >= 0.75)
    {
        const uSeed_t = hashString(seed + '_t') * 100.0
        const uSeed_b = hashString(seed + '_b') * 100.0

        // Experience zones that keep random trees off their ground
        const treeClearZones = EXPERIENCES.filter((def) => def.treeClearRadius)

        for(let iZ = 0; iZ < segments; iZ++)
        {
            for(let iX = 0; iX < segments; iX++)
            {
                const iPositionStride = (iZ * segments + iX) * 3
                const x = positions[iPositionStride    ]
                const y = positions[iPositionStride + 1]
                const z = positions[iPositionStride + 2]

                const iNormalStride = (iZ * segments + iX) * 3
                const normal = vec3.fromValues(
                    normals[iNormalStride    ],
                    normals[iNormalStride + 1],
                    normals[iNormalStride + 2]
                )

                const upward = Math.max(0, normal[1])

                // Above water and relatively flat
                if(y > 0 && upward > 0.95)
                {
                    // Biome noise for dense/sparse areas (-1.0 to 1.0)
                    let biome = snoise3D(x * 0.01 + iterationsOffsets[0][0], z * 0.01 + iterationsOffsets[0][1], uSeed_b)
                    
                    let threshold = 0.95 // sparse
                    if (biome > 0.2) {
                        threshold = 0.6 // dense forest
                    } else if (biome > -0.2) {
                        threshold = 0.85 // medium
                    }

                    let treeNoise = snoise3D(x * 0.5 + iterationsOffsets[0][0], z * 0.5 + iterationsOffsets[0][1], uSeed_t)
                    treeNoise = (treeNoise + 1.0) * 0.5 // Normalize to 0.0 - 1.0

                    if (treeNoise > threshold) {
                        const r1 = pseudoRandom(x, z)
                        const r2 = pseudoRandom(x + 1, z)
                        const r3 = pseudoRandom(x, z + 1)

                        let typeIndex = 0;
                        if (biome > 0.8) {
                            // Orange Grove (16-23)
                            typeIndex = 16 + Math.floor(r1 * 8) % 8;
                        } else if (biome < -0.8) {
                            // Blue Grove (8-15)
                            typeIndex = 8 + Math.floor(r1 * 8) % 8;
                        } else {
                            // Green Forest (0-7)
                            typeIndex = Math.floor(r1 * 8) % 8;
                        }

                        const scale = 1.0 + r2 * 0.5 // 1.0 to 1.5
                        const rotation = r3 * Math.PI * 2

                        // Optional slight position offset to break the grid
                        const r4 = pseudoRandom(x + 2, z)
                        const r5 = pseudoRandom(x, z + 2)
                        const interSegmentX = size / subdivisions
                        const interSegmentZ = size / subdivisions
                        
                        const finalX = x + (r4 - 0.5) * interSegmentX
                        const finalZ = z + (r5 - 0.5) * interSegmentZ

                        // Keep the wall line clean and the gate corridor open
                        const treeDist = Math.hypot(finalX, finalZ)
                        const treeTheta = Math.atan2(finalZ, finalX)
                        const wallRadius = borderRadiusAt(treeTheta)
                        const wallOffset = Math.abs(treeDist - wallRadius)
                        if (wallOffset < BORDER_CLEAR_BAND) continue
                        if (wallOffset < GATE_CORRIDOR && gateDistanceAt(treeTheta, wallRadius) < GATE_WIDTH) continue

                        // Keep experience clear zones free of random trees
                        let inClearZone = false
                        for (const zone of treeClearZones) {
                            if (Math.hypot(finalX - zone.x, finalZ - zone.z) < zone.treeClearRadius) {
                                inClearZone = true
                                break
                            }
                        }
                        if (inClearZone) continue

                        // Inside the map, blue is reserved for the border wall
                        if (typeIndex >= 8 && typeIndex <= 15 && treeDist < wallRadius) {
                            typeIndex -= 8
                        }

                        const finalY = getElevation(finalX, finalZ, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets, experiences)

                        trees.push({
                            position: [finalX, finalY, finalZ],
                            type: typeIndex,
                            scale: scale,
                            rotation: rotation
                        })
                    }
                }
            }
        }
    }

    /**
     * Border wall — BORDER.wallRows staggered rows of blue trees along the
     * coastline. The trees are the visual wall; the impassable barrier is
     * the analytic collision band in State/Player.js, so nothing slips
     * through between trunks. Half-open chunk bounds ensure each wall tree
     * is emitted by exactly one chunk.
     *
     * Emitted at every precision so the coastline reads from anywhere on
     * the map. Distant low-precision chunks place a thinned subset (the two
     * middle rows, every other arc step) at positions identical to the full
     * wall, so nearby LODs fill trees in between instead of reshuffling.
     */
    const isFarChunk = precision < 0.75

    // Quick reject: only walk the ring for chunks that can intersect it
    const maxWobble = BORDER.wobble[0] + BORDER.wobble[1] + BORDER.wobble[2]
    const wallHalfExtent = ((BORDER.wallRows - 1) / 2) * BORDER.wallRowSpacing
    const ringMargin = maxWobble + wallHalfExtent + 3
    const nearX = Math.max(chunkMinX, Math.min(0, chunkMaxX))
    const nearZ = Math.max(chunkMinZ, Math.min(0, chunkMaxZ))
    const chunkMinDist = Math.hypot(nearX, nearZ)
    let chunkMaxDist = 0
    for (const cx of [chunkMinX, chunkMaxX])
        for (const cz of [chunkMinZ, chunkMaxZ])
            chunkMaxDist = Math.max(chunkMaxDist, Math.hypot(cx, cz))

    if (chunkMaxDist >= BORDER.radius - ringMargin && chunkMinDist <= BORDER.radius + ringMargin)
    {
        const WALL_SPACING = BORDER.wallTreeSpacing
        const WALL_ROWS = BORDER.wallRows
        const WALL_ROW_SPACING = BORDER.wallRowSpacing

        let theta = 0
        let iStep = 0
        while (theta < Math.PI * 2)
        {
            const r0 = borderRadiusAt(theta)

            for (let row = 0; row < WALL_ROWS; row++)
            {
                // Far chunks: middle rows on every other arc step only
                if (isFarChunk && (iStep % 2 !== 0 || row === 0 || row === WALL_ROWS - 1)) continue

                // Stagger every other row half a step along the arc
                const t = theta + (row % 2) * (WALL_SPACING * 0.5) / r0
                const r = borderRadiusAt(t) + (row - (WALL_ROWS - 1) / 2) * WALL_ROW_SPACING
                const wx = Math.cos(t) * r
                const wz = Math.sin(t) * r

                if (wx < chunkMinX || wx >= chunkMaxX || wz < chunkMinZ || wz >= chunkMaxZ) continue
                if (gateDistanceAt(t, r0) < GATE_WIDTH * 0.5) continue

                const r1 = pseudoRandom(wx, wz)
                const r2 = pseudoRandom(wx + 1, wz)
                const r3 = pseudoRandom(wx, wz + 1)
                const wy = getElevation(wx, wz, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets, experiences)

                trees.push({
                    position: [wx, wy, wz],
                    type: 8 + Math.floor(r1 * 8) % 8,
                    scale: 1.2 + r2 * 0.4,
                    rotation: r3 * Math.PI * 2
                })
            }

            theta += WALL_SPACING / r0
            iStep++
        }
    }

    /**
     * Experience tree rings — opt-in: only definitions that declare
     * treeRingRadius get a circle of orange trees around their centre
     * (currently just The God's Palm). The worker stays agnostic of
     * specific experiences and only honours declared fields. Half-open
     * chunk bounds ensure each ring tree is emitted by exactly one chunk.
     * Emitted at every precision — a ring is ~50 trees, and like the wall
     * it doubles as a distant landmark.
     */
    for (const def of EXPERIENCES)
    {
        if (!def.treeRingRadius) continue

        // Quick reject: only walk the ring for chunks that can intersect it
        const nearestX = Math.max(chunkMinX, Math.min(def.x, chunkMaxX))
        const nearestZ = Math.max(chunkMinZ, Math.min(def.z, chunkMaxZ))
        if (Math.hypot(nearestX - def.x, nearestZ - def.z) > def.treeRingRadius + 2) continue

        const RING_SPACING = 2.2

        let theta = 0
        while (theta < Math.PI * 2)
        {
            const wx = def.x + Math.cos(theta) * def.treeRingRadius
            const wz = def.z + Math.sin(theta) * def.treeRingRadius
            theta += RING_SPACING / def.treeRingRadius

            if (wx < chunkMinX || wx >= chunkMaxX || wz < chunkMinZ || wz >= chunkMaxZ) continue

            const r1 = pseudoRandom(wx, wz)
            const r2 = pseudoRandom(wx + 1, wz)
            const r3 = pseudoRandom(wx, wz + 1)
            const wy = getElevation(wx, wz, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets, experiences)

            trees.push({
                position: [wx, wy, wz],
                type: 16 + Math.floor(r1 * 8) % 8, // orange grove types
                scale: 1.1 + r2 * 0.4,
                rotation: r3 * Math.PI * 2
            })
        }
    }

    // Post
    postMessage({
        id: id,
        positions: positions,
        normals: normals,
        indices: indices,
        texture: texture,
        uv: uv,
        trees: trees
    })
}