import seedrandom from 'seedrandom'

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
    elevationOffset: 1,
}

/**
 * World border — an organic "coastline" wall of blue trees around the home
 * map, with a single gate due north (-Z).
 */
export const BORDER = {
    radius: 500,
    wobble: [60, 35, 18],    // sinusoid amplitudes (coastline feel)
    clearBand: 12,           // keep random trees off the wall line
    gateAngle: -Math.PI / 2, // north
    gateWidth: 12,           // opening through the wall, world units
    gateCorridor: 30,        // tree-free approach on both sides
    wallRows: 4,             // staggered tree rows across the wall thickness
    wallRowSpacing: 1.6,     // radial distance between rows
    wallTreeSpacing: 1.5,    // arc distance between trees in a row
    wallCollisionPadding: 1.5, // collision skin beyond the outermost rows
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
        id: 'basketball_court',
        label: 'Basketball Court',
        emoji: '🏀',
        description:
            'A flat court zone where you can shoot hoops and explore the basketball experience.',
        x: 150,
        z: 150,
        triggerRadius: 20,
        preloadRadius: 100,
        flattenRadius: 30,
        targetHeight: 5,
        gltfPaths: ['/models/court.glb'],
    },
    {
        id: 'village',
        label: 'Village',
        emoji: '🏘️',
        description:
            'A hillside village with buildings to wander through and discover.',
        x: -200,
        z: -200,
        triggerRadius: 40,
        preloadRadius: 150,
        flattenRadius: 60,
        targetHeight: 12,
        gltfPaths: ['/models/village.glb'],
    },
]

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
 */
export function getElevation(x, y, noise2D, iterationsOffsets, params, experiences) {
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
