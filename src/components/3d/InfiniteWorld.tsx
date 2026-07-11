"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HudCluster } from "./hud/HudCluster";
import { MapPanel } from "./hud/MapPanel";
import { InfoPanel } from "./hud/InfoPanel";
import { SettingsPanel } from "./hud/SettingsPanel";

interface InfiniteWorldProps {
  className?: string;
}

type ActivePanel = "map" | "info" | "settings" | null;

export default function InfiniteWorld({ className }: InfiniteWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const togglePanel = (panel: "info" | "settings") =>
    setActivePanel((cur) => (cur === panel ? null : panel));

  // Detect mobile
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ),
      );
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent browser defaults (e.g. Space / arrow scroll) while playing
  useEffect(() => {
    const GAME_KEYS = [
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "ShiftLeft",
      "ShiftRight",
      "KeyV",
      "KeyB",
      "KeyF",
      "KeyL",
    ];
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setActivePanel(null);
        return;
      }
      if (!GAME_KEYS.includes(e.code)) return;
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Disable game input while a panel is open
  useEffect(() => {
    const controls = gameRef.current?.state?.controls;
    if (!controls) return;
    controls.inputEnabled = activePanel === null;
    if (activePanel) {
      for (const key of Object.keys(controls.keys.down)) {
        controls.keys.down[key] = false;
      }
    }
  }, [activePanel, isLoaded]);

  const handleLoadProgress = useCallback(
    (progress: number) => setLoadProgress(progress),
    [],
  );
  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
    const controls = gameRef.current?.state?.controls;
    if (controls) controls.inputEnabled = true;
  }, []);

  // Boot game engine
  useEffect(() => {
    const shouldBlock = isMobile && process.env.NODE_ENV !== "development";
    if (!containerRef.current || shouldBlock) return;

    let destroyed = false;
    (async () => {
      const { default: Game } = await import("@/lib/infinite-world/Game.js");
      if (destroyed || !containerRef.current) return;
      gameRef.current = new Game(
        containerRef.current,
        handleLoadProgress,
        handleLoadComplete,
      );
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [isMobile, handleLoadProgress, handleLoadComplete]);

  // Mobile block screen
  if (isMobile && process.env.NODE_ENV !== "development") {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-background">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="mb-6 text-6xl">🌍</div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            Desktop Experience
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This 3D experience requires a desktop browser with keyboard and
            mouse controls. Please visit on a desktop device for the full
            experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Panel animation keyframes */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.96) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        .hud-range { height: 6px; outline: none; border: none; }
        .hud-range::-webkit-slider-thumb {
          appearance: none; width: 16px; height: 16px;
          border-radius: 50%; background: hsl(var(--foreground)); cursor: pointer;
          border: 2px solid hsl(var(--background));
        }
        .hud-range::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: hsl(var(--foreground)); cursor: pointer;
          border: 2px solid hsl(var(--background));
        }
      `}</style>

      {/* Loading overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-1000 ${
          isLoaded
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium tracking-wide text-foreground/80">
              Generating World
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{loadProgress}%</p>
          </div>
        </div>
      </div>

      <HudCluster
        gameRef={gameRef}
        isLoaded={isLoaded}
        activePanel={activePanel}
        onTogglePanel={togglePanel}
        onOpenMap={() => setActivePanel("map")}
      />

      {/* Active panel */}
      {activePanel === "map" && (
        <MapPanel
          onClose={() => setActivePanel(null)}
          gameRef={gameRef}
          isLoaded={isLoaded}
        />
      )}
      {activePanel === "info" && (
        <InfoPanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "settings" && (
        <SettingsPanel
          onClose={() => setActivePanel(null)}
          gameRef={gameRef}
        />
      )}

      {/* Three.js canvas */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 outline-none"
        style={{ cursor: "grab" }}
        tabIndex={0}
        onPointerDown={(e) => e.currentTarget.focus()}
      />
    </div>
  );
}
