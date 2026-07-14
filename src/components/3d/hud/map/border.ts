import {
  BORDER,
  TERRAIN_SEED,
  createBorder,
} from "@/lib/infinite-world/worldGen.js";

// Thin wrapper over the shared border formula in worldGen.js
const border = createBorder(TERRAIN_SEED);

export const BORDER_RADIUS: number = BORDER.radius;
export const GATE_ANGLE: number = BORDER.gateAngle;
export const GATE_WIDTH: number = BORDER.gateWidth;

export const borderRadiusAt: (theta: number) => number = border.radiusAt;
export const gateArcDistance: (theta: number, radius: number) => number =
  border.gateArcDistance;
