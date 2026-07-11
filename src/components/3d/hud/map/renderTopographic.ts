import { getTerrainElevation } from "./terrainElevation";

const WATER_LEVEL = 0;

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

export function renderTopographicTerrain(
  ctx: CanvasRenderingContext2D,
  { centerX, centerZ, viewRadius, size, sampleStep = 1, contourInterval = 5 }: TopoRenderOptions
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

  // Draw base background (per-pixel distinction between land/water)
  // To keep it fast, we'll draw land colour everywhere, then draw a rect for water mask,
  // or just loop pixel grid with big rects.
  // Actually, easiest is filling pixel grid at a low resolution.
  const bgStep = size > 200 ? 4 : 2;
  ctx.fillStyle = "#c8ddb0"; // land
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#7ab8d4"; // water
  for (let y = 0; y < size; y += bgStep) {
    for (let x = 0; x < size; x += bgStep) {
      const wx = centerX + (x / size - 0.5) * viewRadius * 2;
      const wz = centerZ + (y / size - 0.5) * viewRadius * 2;
      if (getTerrainElevation(wx, wz) < 0) {
        ctx.fillRect(x, y, bgStep, bgStep);
      }
    }
  }

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
    
    if (level > 0) {
      // Land
      ctx.lineWidth = isMajor ? 1.4 : 0.6;
      ctx.strokeStyle = isMajor ? "rgba(60,38,10,0.95)" : "rgba(80,55,20,0.75)";
    } else {
      // Water
      ctx.lineWidth = isMajor ? 1.1 : 0.5;
      ctx.strokeStyle = isMajor ? "rgba(10,40,90,0.85)" : "rgba(20,60,110,0.6)";
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
