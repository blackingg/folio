// Quality tiers for the infinite world. The heavy knobs (grass/billboard
// density, chunk depth, camera far) are constructor-time — changing tier
// requires a Game reboot (React re-mounts via bootAttempt). Runtime-only
// knobs (pixel ratio, sky RT ratio, foveation) also apply live.

export const QUALITY_TIERS = ['auto', 'low', 'medium', 'high']

export const QUALITY_PRESETS = {
    low: {
        grassDetails: 80,
        billboardDetails: 70,
        chunkMaxDepth: 3,
        pixelRatioCap: 1,
        skyResolutionRatio: 0.15,
        cameraFar: 3000,
        maxInstancesPerTree: 12000
    },
    medium: {
        grassDetails: 120,
        billboardDetails: 100,
        chunkMaxDepth: 4,
        pixelRatioCap: 1.5,
        skyResolutionRatio: 0.2,
        cameraFar: 4000,
        maxInstancesPerTree: 16000
    },
    high: {
        grassDetails: 200,
        billboardDetails: 150,
        chunkMaxDepth: 4,
        pixelRatioCap: 2,
        skyResolutionRatio: 0.2,
        cameraFar: 5000,
        maxInstancesPerTree: 20000
    }
}

// Applied on top of the active tier while an immersive-vr session presents.
// Framebuffer scale must be set before xr.setSession — it is ignored after.
export const VR_OVERLAY = {
    foveation: 1,
    xrFramebufferScale: 1.0,
    skyResolutionRatio: 0.15
}

const STORAGE_KEY = 'iw-quality'

export function getQualityOverride() {
    if (typeof localStorage === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && stored !== 'auto' && QUALITY_PRESETS[stored] ? stored : null
}

export function setQualityOverride(tier) {
    if (typeof localStorage === 'undefined') return
    if (tier === 'auto' || !QUALITY_PRESETS[tier]) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, tier)
}

export function detectTier() {
    if (typeof navigator === 'undefined') return 'high'
    const ua = navigator.userAgent
    // Quest browser is Android-based — check it before the generic mobile test
    if (/OculusBrowser|Quest/i.test(ua)) return 'medium'
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) {
        const memory = navigator.deviceMemory
        return memory && memory < 6 ? 'low' : 'medium'
    }
    return 'high'
}

// Returns { tier, resolved, ...preset }: `tier` is what the user picked
// ('auto' when no override), `resolved` is the preset actually in effect.
export function resolveQuality() {
    const override = getQualityOverride()
    const resolved = override ?? detectTier()
    return { tier: override ?? 'auto', resolved, ...QUALITY_PRESETS[resolved] }
}
