import SimplexNoise from "@/lib/infinite-world/Workers/SimplexNoise.js";
import {
  TERRAIN,
  TERRAIN_SEED,
  EXPERIENCES,
  computeIterationsOffsets,
  getElevation,
} from "@/lib/infinite-world/worldGen.js";

// Thin wrapper over the shared canonical formula in worldGen.js — the map
// recomputes the deterministic world instead of sampling the live scene.
const iterationsOffsets = computeIterationsOffsets(TERRAIN_SEED);

// @ts-expect-error — SimplexNoise seed parameter typed incorrectly in TS fallback
const elevationNoise = new SimplexNoise(TERRAIN_SEED);
const noise2D = (x: number, y: number) => elevationNoise.noise2D(x, y);

const flattens = EXPERIENCES.map((exp: any) => ({
  x: exp.x,
  z: exp.z,
  radius: exp.flattenRadius,
  targetHeight: exp.targetHeight,
}));

export function getTerrainElevation(x: number, z: number): number {
  return getElevation(x, z, noise2D, iterationsOffsets, TERRAIN, flattens);
}
