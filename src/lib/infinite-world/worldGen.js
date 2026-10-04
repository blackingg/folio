import seedrandom from 'seedrandom'
import SimplexNoise from './Workers/SimplexNoise.js'

/**
 * Single source of truth for world generation.
 *
 * Pure data + pure functions only (no three.js, no DOM) so it can be imported
 * from the terrain worker, the engine (State/View), and the React HUD alike.
 * The terrain worker, the HUD map, and the experience registry all derive
 * from what's defined here — change it once, everything agrees.
 */

export const WORLD_SEED = 'p'
export const TERRAIN_SEED = WORLD_SEED + 'b'

export const TERRAIN = {
    subdivisions: 40,
    lacunarity: 2.05,
    persistence: 0.45,
    maxIterations: 6,
    baseFrequency: 0.003,
    baseAmplitude: 40,
    power: 3,
    elevationOffset: 3, // raises the whole landscape — fewer/smaller scattered water pockets (was 1, ~16.6% of the enclosed map below sea level; this measures ~7.5%)
}

/**
 * Rivers — winding channels that actually connect the natural ponds the
 * base terrain formula produces, instead of an independent noise field
 * that carves wherever it happens to cross zero (which doesn't join
 * anything, and cuts an unrelated seam straight through ponds it has no
 * relation to). buildRiverNetwork() below finds the real ponds, connects
 * them with a minimum-spanning tree, and bends each connecting edge into a
 * meandering polyline — then getElevation() just carves within `width` of
 * the nearest polyline segment, which is cheap (no noise sampling) because
 * all the expensive work (flood-fill, MST, warping) happened once upfront.
 */
export const RIVER = {
    detectStep: 10,         // world units between pond-detection grid samples
    minPondCells: 5,        // ignore flood-fill blobs smaller than this (noise speckle, not real ponds)
    maxPonds: 22,           // cap how many of the largest ponds get connected
    warpFrequency: 0.004,   // domain-warp frequency sampled along each path — controls meander wavelength
    warpStrength: 60,       // world units a path point gets displaced by
    samplePointSpacing: 25, // distance between polyline vertices along a straight pond-to-pond edge, before warping
    width: 14,              // half-width of the carved channel, world units
    depth: 16,              // world units carved at a channel's centreline, tapering to 0 at `width`
}

function distToSegment(px, pz, ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az
    const lenSq = dx * dx + dz * dz
    let t = lenSq > 0 ? ((px - ax) * dx + (pz - az) * dz) / lenSq : 0
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

/**
 * Finds the natural ponds the base terrain (no rivers) produces inside the
 * border, connects them with a minimum-spanning tree, and bends each edge
 * into a meandering polyline. Expensive (one grid sample + flood-fill over
 * the whole map) — call once per seed and reuse; getRiverNetwork() below
 * memoizes this.
 */
function buildRiverNetwork(seed) {
    const noise = new SimplexNoise(seed)
    const noise2D = (nx, ny) => noise.noise2D(nx, ny)
    const offsets = computeIterationsOffsets(seed)
    const border = createBorder(seed)
    const flattenZones = EXPERIENCES.map((e) => ({
        x: e.x, z: e.z, radius: e.flattenRadius, targetHeight: e.targetHeight
    }))
    const baseElevationAt = (x, z) =>
        getElevation(x, z, noise2D, offsets, TERRAIN, flattenZones, border)

    // Flood-fill underwater cells on a coarse grid into pond blobs.
    const range = Math.ceil(BORDER.radius + BORDER.wobble.reduce((a, b) => a + b, 0))
    const step = RIVER.detectStep
    const cols = Math.floor((2 * range) / step) + 1
    const toWorld = (ix, iz) => [-range + ix * step, -range + iz * step]

    const underwater = new Uint8Array(cols * cols)
    for (let iz = 0; iz < cols; iz++) {
        for (let ix = 0; ix < cols; ix++) {
            const [x, z] = toWorld(ix, iz)
            if (Math.hypot(x, z) > border.radiusAt(Math.atan2(z, x))) continue
            underwater[iz * cols + ix] = baseElevationAt(x, z) < 0 ? 1 : 0
        }
    }

    const visited = new Uint8Array(cols * cols)
    const ponds = []
    for (let iz = 0; iz < cols; iz++) {
        for (let ix = 0; ix < cols; ix++) {
            const i = iz * cols + ix
            if (!underwater[i] || visited[i]) continue

            const stack = [[ix, iz]]
            visited[i] = 1
            let sumX = 0, sumZ = 0, count = 0
            while (stack.length) {
                const [cx, cz] = stack.pop()
                const [wx, wz] = toWorld(cx, cz)
                sumX += wx; sumZ += wz; count++
                for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = cx + dx, nz = cz + dz
                    if (nx < 0 || nx >= cols || nz < 0 || nz >= cols) continue
                    const ni = nz * cols + nx
                    if (underwater[ni] && !visited[ni]) {
                        visited[ni] = 1
                        stack.push([nx, nz])
                    }
                }
            }
            ponds.push({ x: sumX / count, z: sumZ / count, count })
        }
    }

    const significant = ponds
        .filter((p) => p.count >= RIVER.minPondCells)
        .sort((a, b) => b.count - a.count)
        .slice(0, RIVER.maxPonds)

    // Minimum spanning tree over pond centroids (Prim's — pond counts are small).
    const pondDist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z)
    const edges = []
    if (significant.length > 1) {
        const inTree = new Set([0])
        while (inTree.size < significant.length) {
            let best = null
            for (const i of inTree) {
                for (let j = 0; j < significant.length; j++) {
                    if (inTree.has(j)) continue
                    const d = pondDist(significant[i], significant[j])
                    if (!best || d < best.d) best = { i, j, d }
                }
            }
            if (!best) break
            inTree.add(best.j)
            edges.push(best)
        }
    }

    // Warp the PATH itself into a polyline (not the query point against a
    // straight line) — warping a continuous sequence of path points keeps
    // adjacent samples close together, so the channel stays connected.
    // Warping the query point instead (tried first) regularly displaced it
    // further than `width`, leaving gaps in the middle of the channel.
    const random = seedrandom(seed + '_river')
    const warpOffsets = [
        (random() - 0.5) * 200000, (random() - 0.5) * 200000,
        (random() - 0.5) * 200000, (random() - 0.5) * 200000,
    ]
    const warpPoint = (x, z) => [
        x + noise2D(x * RIVER.warpFrequency + warpOffsets[0], z * RIVER.warpFrequency + warpOffsets[1]) * RIVER.warpStrength,
        z + noise2D(x * RIVER.warpFrequency + warpOffsets[2], z * RIVER.warpFrequency + warpOffsets[3]) * RIVER.warpStrength,
    ]

    const segments = []
    for (const e of edges) {
        const a = significant[e.i], b = significant[e.j]
        const n = Math.max(4, Math.ceil(e.d / RIVER.samplePointSpacing))
        let prev = null
        for (let i = 0; i <= n; i++) {
            const t = i / n
            const [wx, wz] = warpPoint(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)
            if (prev) segments.push({ ax: prev[0], az: prev[1], bx: wx, bz: wz })
            prev = [wx, wz]
        }
    }

    // A straight per-vertex scan over every segment measured ~10x slower
    // terrain generation (220 segments x thousands of vertices per chunk).
    // Bucket segments into a uniform grid instead, so a query point whose
    // cell holds no segments (almost everywhere — rivers are thin) rejects
    // in one Map lookup instead of checking every segment in the network.
    const cellSize = Math.max(50, RIVER.width * 4)
    const grid = new Map()
    for (const s of segments) {
        const minCx = Math.floor((Math.min(s.ax, s.bx) - RIVER.width) / cellSize)
        const maxCx = Math.floor((Math.max(s.ax, s.bx) + RIVER.width) / cellSize)
        const minCz = Math.floor((Math.min(s.az, s.bz) - RIVER.width) / cellSize)
        const maxCz = Math.floor((Math.max(s.az, s.bz) + RIVER.width) / cellSize)
        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cz = minCz; cz <= maxCz; cz++) {
                const key = cx + ',' + cz
                let bucket = grid.get(key)
                if (!bucket) grid.set(key, bucket = [])
                bucket.push(s)
            }
        }
    }

    return { segments, grid, cellSize }
}

const riverNetworkCache = new Map()

/** Memoized per seed — buildRiverNetwork() is too expensive to call per-vertex. */
export function getRiverNetwork(seed) {
    if (!riverNetworkCache.has(seed)) riverNetworkCache.set(seed, buildRiverNetwork(seed))
    return riverNetworkCache.get(seed)
}

/**
 * World border — an organic "coastline" wall of blue trees around the home
 * map, with a single gate due north (-Z).
 */
export const BORDER = {
    radius: 750,
    wobble: [90, 52, 27],    // sinusoid amplitudes (coastline feel) — scaled with radius
    clearBand: 12,           // keep random trees off the wall line
    gateAngle: -Math.PI / 2, // north
    gateWidth: 12,           // opening through the wall, world units
    gateCorridor: 30,        // tree-free approach on both sides
    wallRows: 4,             // staggered tree rows across the wall thickness
    wallRowSpacing: 1.6,     // radial distance between rows
    wallTreeSpacing: 1.5,    // arc distance between trees in a row
    wallCollisionPadding: 1.5, // collision skin beyond the outermost rows
    coastDryHeight: 2,       // min elevation kept along the wall band
}

/** Half-thickness of the wall's collision band, wall centreline to edge */
export function wallCollisionHalfWidth() {
    return ((BORDER.wallRows - 1) / 2) * BORDER.wallRowSpacing
        + BORDER.wallCollisionPadding
}

/**
 * Experience zones — position/flattening data drives terrain generation and
 * the ExperienceManager registry; label/emoji/description drive the HUD map.
 */
export const EXPERIENCES = [
  {
    id: "basketball_court",
    label: "Basketball Court",
    emoji: "🏀",
    description:
      "A flat court zone where you can shoot hoops and explore the basketball experience.",
    x: 150,
    z: 150,
    triggerRadius: 20,
    preloadRadius: 100,
    flattenRadius: 30,
    targetHeight: 5,
    gltfPaths: ["/models/court.glb"],
  },
  {
    id: "village",
    label: "Village",
    emoji: "🏘️",
    description:
      "A hillside village with buildings to wander through and discover.",
    x: -200,
    z: -200,
    triggerRadius: 40,
    preloadRadius: 150,
    flattenRadius: 60,
    targetHeight: 12,
    gltfPaths: ["/models/village.glb"],
  },
  {
    id: "gods_palm",
    label: "God's Palm",
    emoji: "🗿",
    description:
      "The worship grounds of an old god, high on a plateau ringed by orange trees. Step into the pillar of light and be lifted skyward.",
    x: 280,
    z: -60,
    triggerRadius: 30,
    preloadRadius: 1000, // load() only builds the light pillar — cheap, so it exists from anywhere inside the border, a landmark drawing the eye
    flattenRadius: 45,
    targetHeight: 18,
    gltfPaths: [],
    loadingOrb: false, // light experience
    floatRadius: 8, // worship circle — the light pillar; standing inside lifts the character
    treeRingRadius: 18, // circle of orange trees around the worship circle
    treeClearRadius: 45, // keep random trees off the plateau
  },
  {
    id: "shipwreck",
    label: "Shipwreck Bay",
    emoji: "⚓",
    description:
      "A broken hull resting on the seabed of a drowned bay. Walk out until the water closes over your head.",
    x: -42,
    z: -214,
    triggerRadius: 70,
    preloadRadius: 180,
    // A real carved basin, not just a pad under the hull — the natural dip
    // here only reached -12.6, too shallow to read as water a ship could
    // have actually sailed. 90u flatten radius clears a flat -25 floor out
    // to r≈70 (checked against the other EXPERIENCES zones' flatten radii —
    // village is the nearest at ~159u away, so this stays clear of it).
    flattenRadius: 90,
    targetHeight: -25,
    gltfPaths: ["/models/restored-minecraft-shipwreck/source/Ship.glb"],
    loadingOrb: false, // submerged zone — the mist-dome marker assumes dry ground and would poke oddly out of the water; found by swimming, not signposted
  },
];

export function hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++)
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
    return (hash >>> 0) / 4294967296
}

export function linearStep(edgeMin, edgeMax, value) {
    return Math.max(0, Math.min(1, (value - edgeMin) / (edgeMax - edgeMin)))
}

/** The per-octave noise offsets Terrains derives from the seed */
export function computeIterationsOffsets(seed) {
    const random = seedrandom(seed)
    const offsets = []
    for (let i = 0; i < TERRAIN.maxIterations; i++)
        offsets.push([(random() - 0.5) * 200000, (random() - 0.5) * 200000])
    return offsets
}

/**
 * Canonical elevation formula.
 *
 * @param x          world x
 * @param y          world z (named y for historic worker reasons)
 * @param noise2D    seeded 2D simplex sampler: (x, y) => -1..1
 * @param iterationsOffsets  from computeIterationsOffsets(seed)
 * @param params     TERRAIN-shaped params; `iterations` may be lowered for
 *                   distant low-precision chunks
 * @param experiences  optional [{ x, z, radius, targetHeight }] flatten zones
 * @param border       optional result of createBorder(seed) — floors elevation
 *                     near the wall ring at BORDER.coastDryHeight
 * @param riverNetwork  optional result of getRiverNetwork(seed) — carves
 *                      channels connecting the terrain's natural ponds (see RIVER)
 */
export function getElevation(x, y, noise2D, iterationsOffsets, params, experiences, border, riverNetwork) {
    let elevation = 0
    let frequency = params.baseFrequency
    let amplitude = 1
    let normalisation = 0

    const iterations = params.iterations ?? params.maxIterations

    for (let i = 0; i < iterations; i++) {
        const noise = noise2D(
            x * frequency + iterationsOffsets[i][0],
            y * frequency + iterationsOffsets[i][1]
        )
        elevation += noise * amplitude

        normalisation += amplitude
        amplitude *= params.persistence
        frequency *= params.lacunarity
    }

    elevation /= normalisation
    elevation = Math.pow(Math.abs(elevation), params.power) * Math.sign(elevation)
    elevation *= params.baseAmplitude
    elevation += params.elevationOffset

    // Rivers — carved before the experience flatten pass so a zone's own
    // flattening always takes priority over a river that happens to cross it.
    // The network's polylines are precomputed (see buildRiverNetwork) and
    // bucketed into a grid, so this is a cheap lookup for the vast majority
    // of points (no segments in range) rather than scanning every segment.
    if (riverNetwork && riverNetwork.grid.size > 0) {
        const cx = Math.floor(x / riverNetwork.cellSize)
        const cz = Math.floor(y / riverNetwork.cellSize)
        const bucket = riverNetwork.grid.get(cx + ',' + cz)

        if (bucket) {
            let minDist = Infinity
            for (const s of bucket) {
                const d = distToSegment(x, y, s.ax, s.az, s.bx, s.bz)
                if (d < minDist) minDist = d
            }
            const carve = 1 - linearStep(0, RIVER.width, minDist)
            elevation -= RIVER.depth * carve
        }
    }

    // Terrain flattening for experiences
    if (experiences && experiences.length > 0) {
        for (const exp of experiences) {
            const dist = Math.hypot(x - exp.x, y - exp.z)

            if (dist < exp.radius) {
                // Smooth blend over the outer 15 units of the radius
                const innerRadius = Math.max(0, exp.radius - 15)
                let factor = 1

                if (dist > innerRadius) {
                    factor = linearStep(exp.radius, innerRadius, dist)
                }

                elevation = elevation * (1 - factor) + exp.targetHeight * factor
            }
        }
    }

    if (border) {
        const theta = Math.atan2(y, x)
        const offset = Math.abs(Math.hypot(x, y) - border.radiusAt(theta))
        const margin = wallCollisionHalfWidth() + 6

        if (offset < margin) {
            const t = linearStep(margin, 0, offset)
            elevation += (Math.max(elevation, BORDER.coastDryHeight) - elevation) * t
        }
    }

    return elevation
}

/** Seeded border helpers shared by the terrain worker and the HUD map */
export function createBorder(seed) {
    const phaseA = hashString(seed + '_borderA') * Math.PI * 2
    const phaseB = hashString(seed + '_borderB') * Math.PI * 2
    const phaseC = hashString(seed + '_borderC') * Math.PI * 2

    const radiusAt = (theta) =>
        BORDER.radius
        + BORDER.wobble[0] * Math.sin(theta * 3 + phaseA)
        + BORDER.wobble[1] * Math.sin(theta * 5 + phaseB)
        + BORDER.wobble[2] * Math.sin(theta * 9 + phaseC)

    // Arc distance from an angle to the gate centreline, in world units
    const gateArcDistance = (theta, radius) => {
        const dAng = Math.atan2(
            Math.sin(theta - BORDER.gateAngle),
            Math.cos(theta - BORDER.gateAngle)
        )
        return Math.abs(dAng) * radius
    }

    // phases feed the GLSL copy of radiusAt (getBorderBarren.glsl)
    return { radiusAt, gateArcDistance, phases: [phaseA, phaseB, phaseC] }
}
