// Shared constants used across all HUD panels

import { EXPERIENCES } from "@/lib/infinite-world/worldGen.js";

// Wide enough that the world border (500 ± 113 wobble) always fits with margin
export const MAP_WORLD_RADIUS = 650;

export interface ExperienceZone {
  id: string;
  label: string;
  emoji: string;
  description: string;
  x: number;
  z: number;
}

// Derived from the single source of truth in worldGen.js
export const EXPERIENCE_ZONES: ExperienceZone[] = EXPERIENCES.map(
  (exp: any) => ({
    id: exp.id,
    label: exp.label,
    emoji: exp.emoji,
    description: exp.description,
    x: exp.x,
    z: exp.z,
  })
);
