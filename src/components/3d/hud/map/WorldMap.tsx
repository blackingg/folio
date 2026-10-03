"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EXPERIENCE_ZONES, MAP_WORLD_RADIUS, type ExperienceZone } from "../constants";
import { GATE_ANGLE, borderRadiusAt } from "./border";
import {
  drawWorldBorder,
  renderTopographicTerrain,
  worldToCanvas,
} from "./renderTopographic";

const ZONE_HIT_PX = 16; // pointer-to-zone hit radius, CSS pixels
const POPUP_WIDTH = 180; // matches the popup's max-w below
// The full map grows in coarse steps as the player explores the wilds, so
// the terrain layer rebuilds chunk-by-chunk instead of on every frame
const FULL_RADIUS_STEP = 150;

const GATE_WORLD_R = borderRadiusAt(GATE_ANGLE);
const GATE_X = Math.cos(GATE_ANGLE) * GATE_WORLD_R;
const GATE_Z = Math.sin(GATE_ANGLE) * GATE_WORLD_R;

interface TerrainMeta {
  centerX: number;
  centerZ: number;
  viewRadius: number;
}

interface PopupPlacement {
  left: number;
  top: number;
  below: boolean;
}

interface WorldMapProps {
  gameRef: React.RefObject<any>;
  isLoaded: boolean;
  size: number;
  mode: "minimap" | "full";
  className?: string;
  interactive?: boolean;
  onExpand?: () => void;
}

export function WorldMap({
  gameRef,
  isLoaded,
  size,
  mode,
  className,
  interactive,
  onExpand,
}: WorldMapProps) {
  const isInteractive = interactive ?? mode === "full";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terrainImageRef = useRef<ImageBitmap | HTMLCanvasElement | null>(null);
  const terrainMetaRef = useRef<TerrainMeta | null>(null);
  const terrainKeyRef = useRef("");
  const pendingKeyRef = useRef("");
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number | null>(null);
  const [activeZone, setActiveZone] = useState<ExperienceZone | null>(null);
  const [popupPos, setPopupPos] = useState<PopupPlacement | null>(null);

  // The full map starts framing the walled world, then expands to keep the
  // player on the map once they wander into the wilds (and shrinks back
  // when they return — with hysteresis so it never thrashes).
  const [fullRadius, setFullRadius] = useState(MAP_WORLD_RADIUS);

  const viewRadius = mode === "full" ? fullRadius : 140;
  const sampleStep = mode === "full" ? 2 : 3;

  const getCenter = useCallback(() => {
    if (mode === "full") return { x: 0, z: 0 };
    const pos = gameRef.current?.state?.player?.position?.current;
    return { x: pos?.[0] ?? 0, z: pos?.[2] ?? 0 };
  }, [gameRef, mode]);

  // Terrain rebuilds run in a worker (OffscreenCanvas) so they never block
  // the game's render loop; the previous image keeps drawing until the fresh
  // one arrives a few frames later.
  useEffect(() => {
    if (typeof OffscreenCanvas === "undefined" || typeof Worker === "undefined")
      return; // sync fallback path stays active

    const worker = new Worker(
      new URL("./terrainMap.worker.ts", import.meta.url)
    );
    worker.onmessage = (
      event: MessageEvent<{ key: string; bitmap: ImageBitmap } & TerrainMeta>
    ) => {
      const { key, bitmap, centerX, centerZ, viewRadius: imageRadius } = event.data;
      // Drop stale responses — the player kept moving and a newer
      // request is already in flight
      if (key !== pendingKeyRef.current) {
        bitmap.close();
        return;
      }
      const old = terrainImageRef.current;
      if (old instanceof ImageBitmap) old.close();
      terrainImageRef.current = bitmap;
      terrainMetaRef.current = { centerX, centerZ, viewRadius: imageRadius };
      terrainKeyRef.current = key;
      pendingKeyRef.current = "";
    };
    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingKeyRef.current = "";
    };
  }, []);

  const ensureTerrain = useCallback(
    (centerX: number, centerZ: number) => {
      const snapStep = mode === "full" ? 30 : 15;
      const key = `${mode}:${Math.round(centerX / snapStep)}:${Math.round(centerZ / snapStep)}:${viewRadius}:${size}`;
      if (terrainKeyRef.current === key && terrainImageRef.current) return;

      const worker = workerRef.current;
      if (worker) {
        if (pendingKeyRef.current === key) return; // already requested
        pendingKeyRef.current = key;
        worker.postMessage({ key, centerX, centerZ, viewRadius, size, sampleStep });
        return;
      }

      // Fallback: synchronous main-thread render (no OffscreenCanvas support)
      let canvas = terrainImageRef.current;
      if (!(canvas instanceof HTMLCanvasElement)) {
        canvas = document.createElement("canvas");
      }
      canvas.width = size;
      canvas.height = size;
      const tctx = canvas.getContext("2d");
      if (!tctx) return;

      renderTopographicTerrain(tctx, {
        centerX,
        centerZ,
        viewRadius,
        size,
        sampleStep,
        contourInterval: 2,
      });

      terrainImageRef.current = canvas;
      terrainMetaRef.current = { centerX, centerZ, viewRadius };
      terrainKeyRef.current = key;
    },
    [mode, viewRadius, size, sampleStep]
  );

  // Zone hit-testing and popup placement both work in CSS pixels so they
  // stay accurate when the canvas is displayed at a different size than its
  // internal resolution (e.g. the full map on small screens).
  const findZoneAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return null;
      const scale = rect.width / size;
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const center = getCenter();

      let hit: ExperienceZone | null = null;
      let hitDist = Infinity;

      for (const zone of EXPERIENCE_ZONES) {
        const [cx, cy] = worldToCanvas(
          zone.x,
          zone.z,
          center.x,
          center.z,
          viewRadius,
          size
        );
        const dist = Math.hypot(mx - cx * scale, my - cy * scale);
        if (dist < ZONE_HIT_PX && dist < hitDist) {
          hit = zone;
          hitDist = dist;
        }
      }

      return hit;
    },
    [getCenter, size, viewRadius]
  );

  // Anchor the popup to the zone marker (not the cursor) and flip it below
  // the marker near the top edge so the panel's overflow-hidden never clips it.
  const showZonePopup = useCallback(
    (zone: ExperienceZone) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const scale = rect.width / size;
      const center = getCenter();
      const [cx, cy] = worldToCanvas(
        zone.x,
        zone.z,
        center.x,
        center.z,
        viewRadius,
        size
      );
      const x = cx * scale;
      const y = cy * scale;
      const below = y < 110;

      setActiveZone(zone);
      setPopupPos({
        left: Math.min(Math.max(x + 12, 8), Math.max(8, rect.width - POPUP_WIDTH - 8)),
        top: below ? y + 14 : y - 14,
        below,
      });
    },
    [getCenter, size, viewRadius]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) return;
    const zone = findZoneAt(e.clientX, e.clientY);
    if (zone) {
      showZonePopup(zone);
    } else if (e.buttons === 0) {
      setActiveZone(null);
      setPopupPos(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteractive) {
      onExpand?.();
      return;
    }
    const zone = findZoneAt(e.clientX, e.clientY);
    if (zone) {
      showZonePopup(zone);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const center = getCenter();
      ensureTerrain(center.x, center.z);

      ctx.clearRect(0, 0, size, size);

      // Base land colour under everything — covers the frames where the
      // cached terrain image doesn't span the whole current view yet
      ctx.fillStyle = "#8da67c";
      ctx.fillRect(0, 0, size, size);

      // Draw the cached terrain image world-aligned: while a rebuild is in
      // flight the old image lands at its true offset/scale instead of being
      // stretched over the new view, so recenters and expansions don't jump.
      const meta = terrainMetaRef.current;
      if (terrainImageRef.current && meta) {
        const [dx, dy] = worldToCanvas(
          meta.centerX - meta.viewRadius,
          meta.centerZ - meta.viewRadius,
          center.x,
          center.z,
          viewRadius,
          size
        );
        const dw = (meta.viewRadius / viewRadius) * size;
        ctx.drawImage(terrainImageRef.current, dx, dy, dw, dw);
      }

      drawWorldBorder(ctx, {
        centerX: center.x,
        centerZ: center.z,
        viewRadius,
        size,
        gateLabel: mode === "full",
      });

      for (const zone of EXPERIENCE_ZONES) {
        const [cx, cy] = worldToCanvas(
          zone.x,
          zone.z,
          center.x,
          center.z,
          viewRadius,
          size
        );
        if (cx < -20 || cy < -20 || cx > size + 20 || cy > size + 20) continue;

        const isActive = activeZone?.id === zone.id;
        ctx.font = isActive ? "22px system-ui" : "18px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(zone.emoji, cx, cy);
      }

      const game = gameRef.current;
      if (game?.state?.player) {
        const pos = game.state.player.position.current;
        const rot = game.state.player.rotation ?? 0;
        const playerDist = Math.hypot(pos[0], pos[2]);
        const playerTheta = Math.atan2(pos[2], pos[0]);
        const inWilds = playerDist > borderRadiusAt(playerTheta) + 6;

        if (mode === "full") {
          // Expand to keep the player on the map; shrink back home with a
          // wide hysteresis band so the terrain worker isn't thrashed.
          const expand = playerDist + 80 > fullRadius;
          const shrink =
            fullRadius > MAP_WORLD_RADIUS && playerDist + 300 < fullRadius;
          if (expand || shrink) {
            const next = Math.max(
              MAP_WORLD_RADIUS,
              Math.ceil((playerDist + 150) / FULL_RADIUS_STEP) * FULL_RADIUS_STEP
            );
            if (next !== fullRadius) setFullRadius(next);
          }
        }

        const [px, py] = worldToCanvas(
          pos[0],
          pos[2],
          center.x,
          center.z,
          viewRadius,
          size
        );

        // Way back home: dotted line from the player to the gate while in
        // the wilds (full map only — the minimap gets an edge chevron below)
        if (mode === "full" && inWilds) {
          const [gcx, gcy] = worldToCanvas(
            GATE_X,
            GATE_Z,
            center.x,
            center.z,
            viewRadius,
            size
          );
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(gcx, gcy);
          ctx.setLineDash([3, 5]);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
          ctx.stroke();
          ctx.restore();
        }

        // Player marker (clamped a hair inside the map for the transient
        // frames before an expansion lands)
        const mpx = Math.min(Math.max(px, 9), size - 9);
        const mpy = Math.min(Math.max(py, 9), size - 9);
        ctx.save();
        ctx.translate(mpx, mpy);
        ctx.rotate(-rot);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(5, 5);
        ctx.lineTo(0, 2.5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Minimap compass back to the gate: when the player is in the wilds
        // and the gate is off-view, pin a chevron + distance at the map edge
        if (mode === "minimap" && inWilds) {
          const [gcx, gcy] = worldToCanvas(
            GATE_X,
            GATE_Z,
            center.x,
            center.z,
            viewRadius,
            size
          );
          const gateVisible =
            gcx > 14 && gcy > 14 && gcx < size - 14 && gcy < size - 14;
          if (!gateVisible) {
            const ang = Math.atan2(GATE_Z - pos[2], GATE_X - pos[0]);
            const edgeR = size / 2 - 13;
            const ex = size / 2 + Math.cos(ang) * edgeR;
            const ey = size / 2 + Math.sin(ang) * edgeR;

            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(ang + Math.PI / 2);
            ctx.fillStyle = "#f59e0b";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(5, 4);
            ctx.lineTo(-5, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            const gateDist = Math.hypot(GATE_X - pos[0], GATE_Z - pos[2]);
            const lx = size / 2 + Math.cos(ang) * (edgeR - 18);
            const ly = size / 2 + Math.sin(ang) * (edgeR - 18);
            ctx.save();
            ctx.font = "bold 9px system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
            ctx.lineWidth = 3;
            ctx.strokeText(`${Math.round(gateDist)}m`, lx, ly);
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.fillText(`${Math.round(gateDist)}m`, lx, ly);
            ctx.restore();
          }
        }
      }

      if (mode === "full") {
        // Outlined like the Gate label — plain white washed out against the
        // shaded relief
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
        ctx.lineWidth = 3;
        const compass: Array<[string, number, number]> = [
          ["N", size / 2, 10],
          ["S", size / 2, size - 10],
          ["E", size - 10, size / 2],
          ["W", 10, size / 2],
        ];
        for (const [label, x, y] of compass) ctx.strokeText(label, x, y);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        for (const [label, x, y] of compass) ctx.fillText(label, x, y);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    isLoaded,
    gameRef,
    size,
    mode,
    viewRadius,
    fullRadius,
    getCenter,
    ensureTerrain,
    activeZone,
  ]);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={cn(
          "block h-full w-full",
          isInteractive ? "cursor-crosshair" : "pointer-events-none"
        )}
        onPointerMove={isInteractive ? handlePointerMove : undefined}
        onPointerLeave={
          isInteractive
            ? () => {
                setActiveZone(null);
                setPopupPos(null);
              }
            : undefined
        }
        onClick={isInteractive ? handleClick : undefined}
      />

      {isInteractive && activeZone && popupPos && (
        <div
          className="pointer-events-none absolute z-10 max-w-[180px] rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: popupPos.left,
            top: popupPos.top,
            transform: popupPos.below ? undefined : "translateY(-100%)",
          }}
        >
          <p className="text-sm font-medium text-popover-foreground">
            {activeZone.emoji} {activeZone.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {activeZone.description}
          </p>
        </div>
      )}
    </div>
  );
}
