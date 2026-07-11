"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EXPERIENCE_ZONES, MAP_WORLD_RADIUS, type ExperienceZone } from "../constants";
import {
  canvasToWorld,
  renderTopographicTerrain,
  worldToCanvas,
} from "./renderTopographic";

const ZONE_HIT_RADIUS = 22;

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
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const [activeZone, setActiveZone] = useState<ExperienceZone | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  const viewRadius = mode === "full" ? MAP_WORLD_RADIUS : 140;
  const sampleStep = mode === "full" ? 2 : 3;

  const getCenter = useCallback(() => {
    if (mode === "full") return { x: 0, z: 0 };
    const pos = gameRef.current?.state?.player?.position?.current;
    return { x: pos?.[0] ?? 0, z: pos?.[2] ?? 0 };
  }, [gameRef, mode]);

  const ensureTerrain = useCallback(
    (centerX: number, centerZ: number) => {
      const snapStep = mode === "full" ? 30 : 15;
      const key = `${mode}:${Math.round(centerX / snapStep)}:${Math.round(centerZ / snapStep)}:${viewRadius}:${size}`;
      if (terrainKeyRef.current === key && terrainCanvasRef.current) return;

      if (!terrainCanvasRef.current) {
        terrainCanvasRef.current = document.createElement("canvas");
      }

      const terrainCanvas = terrainCanvasRef.current;
      terrainCanvas.width = size;
      terrainCanvas.height = size;
      const tctx = terrainCanvas.getContext("2d");
      if (!tctx) return;

      renderTopographicTerrain(tctx, {
        centerX,
        centerZ,
        viewRadius,
        size,
        sampleStep,
        contourInterval: 5,
      });

      terrainKeyRef.current = key;
    },
    [mode, viewRadius, size, sampleStep]
  );

  const findZoneAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * size;
      const py = ((clientY - rect.top) / rect.height) * size;
      const center = getCenter();
      const [wx, wz] = canvasToWorld(px, py, center.x, center.z, viewRadius, size);

      let hit: ExperienceZone | null = null;
      let hitDist = Infinity;

      for (const zone of EXPERIENCE_ZONES) {
        const dist = Math.hypot(wx - zone.x, wz - zone.z);
        if (dist < ZONE_HIT_RADIUS && dist < hitDist) {
          hit = zone;
          hitDist = dist;
        }
      }

      return hit;
    },
    [getCenter, size, viewRadius]
  );

  const showZonePopup = useCallback(
    (zone: ExperienceZone, clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setActiveZone(zone);
      setPopupPos({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    },
    []
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) return;
    const zone = findZoneAt(e.clientX, e.clientY);
    if (zone) {
      showZonePopup(zone, e.clientX, e.clientY);
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
      showZonePopup(zone, e.clientX, e.clientY);
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

      if (terrainCanvasRef.current) {
        ctx.drawImage(terrainCanvasRef.current, 0, 0, size, size);
      }

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
        const [px, py] = worldToCanvas(
          pos[0],
          pos[2],
          center.x,
          center.z,
          viewRadius,
          size
        );

        ctx.save();
        ctx.translate(px, py);
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
      }

      if (mode === "full") {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("N", size / 2, 10);
        ctx.fillText("S", size / 2, size - 10);
        ctx.fillText("E", size - 10, size / 2);
        ctx.fillText("W", 10, size / 2);
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
            left: Math.min(popupPos.x + 12, size - 170),
            top: Math.max(popupPos.y - 8, 8),
            transform: "translateY(-100%)",
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
