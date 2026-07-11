// Shared constants used across all HUD panels

export const MAP_WORLD_RADIUS = 600;

export const EXPERIENCE_ZONES = [
  {
    id: "basketball_court",
    label: "Basketball Court",
    emoji: "🏀",
    description: "A flat court zone where you can shoot hoops and explore the basketball experience.",
    x: 150,
    z: 150,
  },
  {
    id: "village",
    label: "Village",
    emoji: "🏘️",
    description: "A hillside village with buildings to wander through and discover.",
    x: -200,
    z: -200,
  },
] as const;

export type ExperienceZone = (typeof EXPERIENCE_ZONES)[number];
