/**
 * Map terrain worker — renders the topographic terrain layer (elevation
 * sampling + marching squares + painting) off the main thread so rebuilds
 * never stall the game's render loop.
 *
 * Receives { key, centerX, centerZ, viewRadius, size, sampleStep }, renders
 * into an OffscreenCanvas, and posts back { key, bitmap, centerX, centerZ,
 * viewRadius } with the bitmap transferred (zero-copy).
 */

import { renderTopographicTerrain } from "./renderTopographic";

interface RenderRequest {
  key: string;
  centerX: number;
  centerZ: number;
  viewRadius: number;
  size: number;
  sampleStep: number;
}

self.onmessage = (event: MessageEvent<RenderRequest>) => {
  const { key, centerX, centerZ, viewRadius, size, sampleStep } = event.data;

  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  renderTopographicTerrain(ctx, {
    centerX,
    centerZ,
    viewRadius,
    size,
    sampleStep,
    contourInterval: 2,
  });

  const bitmap = canvas.transferToImageBitmap();
  // Echo the view params so the main thread can draw this image
  // world-aligned even after the live view has moved or rescaled
  (self as unknown as Worker).postMessage(
    { key, bitmap, centerX, centerZ, viewRadius },
    [bitmap]
  );
};
