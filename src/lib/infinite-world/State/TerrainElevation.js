import SimplexNoise from '../Workers/SimplexNoise.js'
import {
    TERRAIN,
    TERRAIN_SEED,
    EXPERIENCES,
    computeIterationsOffsets,
    createBorder,
    getRiverNetwork,
    getElevation,
} from '../worldGen.js'

// Precise, tier-independent elevation for gameplay (walk/swim Y) — samples
// the canonical analytic formula directly instead of interpolating the
// quality-tier-scaled render mesh, which can smooth away narrow water
// features at low subdivisions. Mirrors the HUD map's own independent
// recompute (hud/map/terrainElevation.ts) — each execution context keeps
// its own seeded noise instance rather than sharing state across threads.
const iterationsOffsets = computeIterationsOffsets(TERRAIN_SEED)
const border = createBorder(TERRAIN_SEED)
const riverNetwork = getRiverNetwork(TERRAIN_SEED)

const elevationNoise = new SimplexNoise(TERRAIN_SEED)
const noise2D = (x, y) => elevationNoise.noise2D(x, y)

const flattens = EXPERIENCES.map((exp) => ({
    x: exp.x,
    z: exp.z,
    radius: exp.flattenRadius,
    targetHeight: exp.targetHeight,
}))

export function getPreciseElevation(x, z) {
    return getElevation(x, z, noise2D, iterationsOffsets, TERRAIN, flattens, border, riverNetwork)
}
