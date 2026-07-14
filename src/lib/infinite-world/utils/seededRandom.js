/**
 * Deterministic Math.random() replacement (mulberry32) seeded from a string.
 *
 * Used for cosmetic scatter (stars, grass blades, billboard jitter) so every
 * visitor sees the exact same world — the structural terrain/tree generation
 * is already seeded through the terrain worker.
 */
export default function seededRandom(seedString) {
    let h = 0
    for (let i = 0; i < seedString.length; i++)
        h = Math.imul(31, h) + seedString.charCodeAt(i) | 0

    let a = h >>> 0
    return () => {
        a |= 0
        a = a + 0x6D2B79F5 | 0
        let t = Math.imul(a ^ a >>> 15, 1 | a)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}
