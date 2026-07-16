import { getTerrainElevation } from "./terrainElevation";
import { GATE_ANGLE, borderRadiusAt, gateArcDistance } from "./border";

const WATER_LEVEL = 0;

// Works on the main thread and inside the map worker alike
export type Canvas2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export interface TopoRenderOptions {
  centerX: number;
  centerZ: number;
  viewRadius: number;
  size: number;
  sampleStep?: number;
  contourInterval?: number;
}

function buildElevationGrid(
  centerX: number,
  centerZ: number,
  viewRadius: number,
  size: number,
  step: number
) {
  const cols = Math.floor(size / step) + 1;
  const grid = new Float32Array(cols * cols);
  
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const wx = centerX + ((x * step) / size - 0.5) * viewRadius * 2;
      const wz = centerZ + ((y * step) / size - 0.5) * viewRadius * 2;
      grid[y * cols + x] = getTerrainElevation(wx, wz);
    }
  }
  return { grid, cols, step };
}

type Point = [number, number];

// Extract contour paths for a single elevation level using marching squares
function marchingSquares(
  grid: Float32Array,
  cols: number,
  step: number,
  level: number
): Point[][] {
  const segments: [Point, Point][] = [];

  for (let y = 0; y < cols - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const v00 = grid[y * cols + x];
      const v10 = grid[y * cols + (x + 1)];
      const v01 = grid[(y + 1) * cols + x];
      const v11 = grid[(y + 1) * cols + (x + 1)];

      let caseIdx = 0;
      if (v00 >= level) caseIdx |= 1;
      if (v10 >= level) caseIdx |= 2;
      if (v11 >= level) caseIdx |= 4;
      if (v01 >= level) caseIdx |= 8;

      if (caseIdx === 0 || caseIdx === 15) continue;

      const px = x * step;
      const py = y * step;

      // Linear interpolation helper
      const getPt = (p1x: number, p1y: number, v1: number, p2x: number, p2y: number, v2: number): Point => {
        const t = (level - v1) / (v2 - v1 + 1e-9);
        return [p1x + (p2x - p1x) * t, p1y + (p2y - p1y) * t];
      };

      const top = () => getPt(px, py, v00, px + step, py, v10);
      const right = () => getPt(px + step, py, v10, px + step, py + step, v11);
      const bottom = () => getPt(px, py + step, v01, px + step, py + step, v11);
      const left = () => getPt(px, py, v00, px, py + step, v01);

      switch (caseIdx) {
        case 1:
        case 14:
          segments.push([left(), top()]);
          break;
        case 2:
        case 13:
          segments.push([top(), right()]);
          break;
        case 4:
        case 11:
          segments.push([right(), bottom()]);
          break;
        case 8:
        case 7:
          segments.push([bottom(), left()]);
          break;
        case 3:
        case 12:
          segments.push([left(), right()]);
          break;
        case 6:
        case 9:
          segments.push([top(), bottom()]);
          break;
        case 5:
          segments.push([left(), top()], [right(), bottom()]);
          break;
        case 10:
          segments.push([top(), right()], [bottom(), left()]);
          break;
      }
    }
  }

  // Connect segments into continuous polylines (simplistic chaining)
  const paths: Point[][] = [];
  const startMap = new Map<string, Point[]>();
  const endMap = new Map<string, Point[]>();

  const toKey = (p: Point) => `${Math.round(p[0]*10)},${Math.round(p[1]*10)}`;

  for (const [p1, p2] of segments) {
    const k1 = toKey(p1);
    const k2 = toKey(p2);

    const path1 = endMap.get(k1);
    const path2 = startMap.get(k2);

    if (path1 && path2) {
      if (path1 !== path2) {
        path1.push(...path2.slice(1));
        endMap.set(toKey(path1[path1.length - 1]), path1);
        startMap.delete(k2);
      } else {
        path1.push(p2);
      }
    } else if (path1) {
      path1.push(p2);
      endMap.delete(k1);
      endMap.set(k2, path1);
    } else if (path2) {
      path2.unshift(p1);
      startMap.delete(k2);
      startMap.set(k1, path2);
    } else {
      const newPath = [p1, p2];
      startMap.set(k1, newPath);
      endMap.set(k2, newPath);
      paths.push(newPath);
    }
  }

  return paths;
}

function makeCanvas(w: number, h: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Land ramp low → high, anchored on the original flat land colour #8da67c
const LAND_LOW = [123, 152, 106];
const LAND_HIGH = [201, 190, 146];
// Water ramp shallow → deep, anchored on the original flat water #7ab8d4
const WATER_SHALLOW = [122, 184, 212];
const WATER_DEEP = [56, 118, 158];

/**
 * Hillshaded, elevation-tinted relief layer painted from the contour grid.
 * This is what makes the small bumps visible: relief under one contour
 * interval still catches light on one side and shadow on the other, and
 * higher ground fades toward a sandy tint. Rendered at grid resolution into
 * an ImageData then scaled up with smoothing — effectively free next to the
 * elevation sampling itself.
 */
function drawShadedRelief(
  ctx: Canvas2D,
  grid: Float32Array,
  cols: number,
  extractStep: number,
  viewRadius: number,
  size: number
) {
  const small = makeCanvas(cols, cols);
  const sctx = small.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!sctx) return;

  const img = sctx.createImageData(cols, cols);
  const data = img.data;

  // World-space distance between grid samples — normalises the gradient so
  // shading strength doesn't change with zoom level
  const cellWorld = extractStep * ((viewRadius * 2) / size);

  const at = (x: number, y: number) =>
    grid[
      Math.min(cols - 1, Math.max(0, y)) * cols +
        Math.min(cols - 1, Math.max(0, x))
    ];

  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const e = grid[y * cols + x];
      let r: number, g: number, b: number;

      if (e < WATER_LEVEL) {
        // Depth tint only — real topo maps don't hillshade water
        const t = clamp01(-e / 10);
        r = lerp(WATER_SHALLOW[0], WATER_DEEP[0], t);
        g = lerp(WATER_SHALLOW[1], WATER_DEEP[1], t);
        b = lerp(WATER_SHALLOW[2], WATER_DEEP[2], t);
      } else {
        const t = clamp01(e / 40);
        r = lerp(LAND_LOW[0], LAND_HIGH[0], t);
        g = lerp(LAND_LOW[1], LAND_HIGH[1], t);
        b = lerp(LAND_LOW[2], LAND_HIGH[2], t);

        // Emboss hillshade, light from the north-west: slopes rising toward
        // the south-east face the light and brighten, the far side darkens
        const relief =
          (at(x + 1, y + 1) - at(x - 1, y - 1)) / (cellWorld * 2.828);
        const light = 1 + Math.max(-0.4, Math.min(0.4, relief * 1.1));
        r *= light;
        g *= light;
        b *= light;
      }

      const i = (y * cols + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  sctx.putImageData(img, 0, 0);

  // Scale up with smoothing; offset by half a cell so sample points land on
  // their true canvas positions
  const half = extractStep * 0.5;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    small as CanvasImageSource,
    -half,
    -half,
    cols * extractStep,
    cols * extractStep
  );
}

export function renderTopographicTerrain(
  ctx: Canvas2D,
  { centerX, centerZ, viewRadius, size, sampleStep = 1, contourInterval = 2 }: TopoRenderOptions
) {
  // Use a coarser step for grid extraction to save performance, as paths are smooth anyway
  const extractStep = size > 200 ? 3 : 2;
  const { grid, cols } = buildElevationGrid(centerX, centerZ, viewRadius, size, extractStep);

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] < min) min = grid[i];
    if (grid[i] > max) max = grid[i];
  }

  // Draw base background (land everywhere as safety, then the shaded
  // relief layer on top). The relief layer reuses the elevation grid built
  // for the contours instead of re-sampling the 6-octave noise field.
  ctx.fillStyle = "#8da67c"; // land
  ctx.fillRect(0, 0, size, size);
  drawShadedRelief(ctx, grid, cols, extractStep, viewRadius, size);

  // Draw grid
  const worldPerPixel = (viewRadius * 2) / size;
  const gridWorldSpacing = (viewRadius * 2) / 10;
  const gridPixelSpacing = gridWorldSpacing / worldPerPixel;
  
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(40,100,150,0.12)"; // water grid base (land will mostly mask it or we can just use a generic one)
  // Let's just use a general soft grid colour
  ctx.strokeStyle = "rgba(80, 115, 60, 0.15)";
  ctx.beginPath();
  const startXOffset = ((centerX - viewRadius) % gridWorldSpacing) / worldPerPixel;
  for (let x = -startXOffset; x < size; x += gridPixelSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
  }
  const startZOffset = ((centerZ - viewRadius) % gridWorldSpacing) / worldPerPixel;
  for (let y = -startZOffset; y < size; y += gridPixelSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
  }
  ctx.stroke();

  // Draw contour lines
  const startLevel = Math.floor(min / contourInterval) * contourInterval;
  const endLevel = Math.ceil(max / contourInterval) * contourInterval;

  const drawPaths = (paths: Point[][]) => {
    ctx.beginPath();
    for (const path of paths) {
      if (path.length === 0) continue;
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
    }
    ctx.stroke();
  };

  for (let level = startLevel; level <= endLevel; level += contourInterval) {
    if (level === 0) continue; // Skip coastline, draw it last

    const isMajor = level % (contourInterval * 5) === 0;
    
    // Minor lines are kept faint — at a 2-unit interval they get dense on
    // steep ground, and the hillshade already carries the relief
    if (level > 0) {
      // Land
      ctx.lineWidth = isMajor ? 1.4 : 0.5;
      ctx.strokeStyle = isMajor ? "rgba(60,38,10,0.95)" : "rgba(80,55,20,0.5)";
    } else {
      // Water
      ctx.lineWidth = isMajor ? 1.1 : 0.4;
      ctx.strokeStyle = isMajor ? "rgba(10,40,90,0.85)" : "rgba(20,60,110,0.4)";
    }

    const paths = marchingSquares(grid, cols, extractStep, level);
    drawPaths(paths);
  }

  // Draw Coastline (level 0)
  if (min <= 0 && max >= 0) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#2a5a7a";
    const coastPaths = marchingSquares(grid, cols, extractStep, 0);
    drawPaths(coastPaths);
  }
}

export interface BorderRenderOptions {
  centerX: number;
  centerZ: number;
  viewRadius: number;
  size: number;
  gateLabel?: boolean;
}

/**
 * Draw the blue-tree world border, the gate opening, and shade the wilds
 * beyond the wall. Cheap enough to run per-frame so it tracks the minimap
 * centre smoothly instead of snapping with the cached terrain layer.
 */
export function drawWorldBorder(
  ctx: CanvasRenderingContext2D,
  { centerX, centerZ, viewRadius, size, gateLabel }: BorderRenderOptions
) {
  const SAMPLES = 720;
  // The real opening is 12 units — draw it wider so it reads at map scale
  const MAP_GATE_GAP = 15;

  const pointAt = (theta: number): [number, number] => {
    const r = borderRadiusAt(theta);
    return worldToCanvas(
      Math.cos(theta) * r,
      Math.sin(theta) * r,
      centerX,
      centerZ,
      viewRadius,
      size
    );
  };

  // Shade everything outside the border — the wilds
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;
    const [cx, cy] = pointAt(t);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(15, 20, 40, 0.16)";
  ctx.fill("evenodd");
  ctx.restore();

  // The wall — dark underlay, then a dotted blue tree-line on top,
  // both broken at the gate
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const passes: Array<{ width: number; style: string; dash: number[] }> = [
    { width: 4.5, style: "rgba(15, 35, 90, 0.45)", dash: [] },
    { width: 3, style: "#4f7df9", dash: [0.1, 6] },
  ];

  for (const pass of passes) {
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i <= SAMPLES; i++) {
      const t = (i / SAMPLES) * Math.PI * 2;
      const r = borderRadiusAt(t);
      if (gateArcDistance(t, r) < MAP_GATE_GAP) {
        penDown = false;
        continue;
      }
      const [cx, cy] = worldToCanvas(
        Math.cos(t) * r,
        Math.sin(t) * r,
        centerX,
        centerZ,
        viewRadius,
        size
      );
      if (!penDown) {
        ctx.moveTo(cx, cy);
        penDown = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.lineWidth = pass.width;
    ctx.strokeStyle = pass.style;
    ctx.setLineDash(pass.dash);
    ctx.stroke();
  }
  ctx.restore();

  // Gate marker — amber diamond at the opening
  const [gx, gy] = pointAt(GATE_ANGLE);
  if (gx > -20 && gy > -20 && gx < size + 20 && gy < size + 20) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#f59e0b";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(-4.5, -4.5, 9, 9);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (gateLabel) {
      ctx.save();
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
      ctx.lineWidth = 3;
      ctx.strokeText("Gate", gx, gy - 8);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillText("Gate", gx, gy - 8);
      ctx.restore();
    }
  }
}

export function worldToCanvas(
  wx: number,
  wz: number,
  centerX: number,
  centerZ: number,
  viewRadius: number,
  size: number
): [number, number] {
  return [
    ((wx - centerX) / viewRadius * 0.5 + 0.5) * size,
    ((wz - centerZ) / viewRadius * 0.5 + 0.5) * size,
  ];
}

export function canvasToWorld(
  px: number,
  py: number,
  centerX: number,
  centerZ: number,
  viewRadius: number,
  size: number
): [number, number] {
  return [
    centerX + (px / size - 0.5) * viewRadius * 2,
    centerZ + (py / size - 0.5) * viewRadius * 2,
  ];
}
