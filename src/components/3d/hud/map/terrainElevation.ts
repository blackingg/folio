import seedrandom from "seedrandom";
// @ts-expect-error — worker module, no types
import SimplexNoise from "@/lib/infinite-world/Workers/SimplexNoise.js";

const TERRAIN_SEED = "pb";
const LACUNARITY = 2.05;
const PERSISTENCE = 0.45;
const ITERATIONS = 6;
const BASE_FREQUENCY = 0.003;
const BASE_AMPLITUDE = 40;
const POWER = 3;
const ELEVATION_OFFSET = 1;

const EXPERIENCE_FLATTENS = [
  { x: 150, z: 150, radius: 30, targetHeight: 5 },
  { x: -200, z: -200, radius: 60, targetHeight: 12 },
] as const;

const random = seedrandom(TERRAIN_SEED);
const iterationsOffsets: [number, number][] = [];

for (let i = 0; i < 6; i++) {
  iterationsOffsets.push([
    (random() - 0.5) * 200000,
    (random() - 0.5) * 200000,
  ]);
}

const elevationNoise = new SimplexNoise(TERRAIN_SEED);

function linearStep(edgeMin: number, edgeMax: number, value: number) {
  return Math.max(0, Math.min(1, (value - edgeMin) / (edgeMax - edgeMin)));
}

export function getTerrainElevation(x: number, z: number): number {
  let elevation = 0;
  let frequency = BASE_FREQUENCY;
  let amplitude = 1;
  let normalisation = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const noise = elevationNoise.noise2D(
      x * frequency + iterationsOffsets[i][0],
      z * frequency + iterationsOffsets[i][1]
    );
    elevation += noise * amplitude;
    normalisation += amplitude;
    amplitude *= PERSISTENCE;
    frequency *= LACUNARITY;
  }

  elevation /= normalisation;
  elevation = Math.pow(Math.abs(elevation), POWER) * Math.sign(elevation);
  elevation *= BASE_AMPLITUDE;
  elevation += ELEVATION_OFFSET;

  for (const exp of EXPERIENCE_FLATTENS) {
    const dist = Math.hypot(x - exp.x, z - exp.z);
    if (dist < exp.radius) {
      const innerRadius = Math.max(0, exp.radius - 15);
      let factor = 1;
      if (dist > innerRadius) {
        factor = linearStep(exp.radius, innerRadius, dist);
      }
      elevation = elevation * (1 - factor) + exp.targetHeight * factor;
    }
  }

  return elevation;
}
