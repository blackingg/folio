"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HudCluster } from "./hud/HudCluster";
import { TouchControls } from "./hud/TouchControls";
import { WorldMenu, type MenuTab } from "./hud/WorldMenu";
import { WorldLoader } from "./WorldLoader";

interface InfiniteWorldProps {
  className?: string;
}

export default function InfiniteWorld({ className }: InfiniteWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuTab, setMenuTab] = useState<MenuTab | null>(null);

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
        setMenuTab(null);
        return;
      }
      if (e.code === "KeyM") {
        setMenuTab((cur) => (cur === null ? "map" : null));
        return;
      }
      if (!GAME_KEYS.includes(e.code)) return;
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Disable game input while the menu is open
  useEffect(() => {
    const controls = gameRef.current?.state?.controls;
    if (!controls) return;
    controls.inputEnabled = menuTab === null;
    if (menuTab) {
      for (const key of Object.keys(controls.keys.down)) {
        controls.keys.down[key] = false;
      }
    }
  }, [menuTab, isLoaded]);

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
  const [bootFailed, setBootFailed] = useState(false);
  const [bootAttempt, setBootAttempt] = useState(0);

  // Full engine reboot (quality tier changes need constructor-time knobs).
  // The cached WebGL context makes this cheap; the loader overlay returns
  // while the 9 main chunks regenerate.
  const rebootGame = useCallback(() => {
    setMenuTab(null);
    setIsLoaded(false);
    setLoadProgress(0);
    setBootAttempt((attempt) => attempt + 1);
  }, []);
  useEffect(() => {
    if (!containerRef.current || bootFailed) return;

    let destroyed = false;
    (async () => {
      const { default: Game } = await import("@/lib/infinite-world/Game.js");
      if (destroyed || !containerRef.current) return;
      try {
        gameRef.current = new Game(
          containerRef.current,
          handleLoadProgress,
          handleLoadComplete,
        );
      } catch (error) {
        // Typically "Error creating WebGL context" — GPU unavailable,
        // context cap reached, or the browser blocked the page
        console.error("[InfiniteWorld] Failed to boot engine:", error);
        setBootFailed(true);
      }
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [handleLoadProgress, handleLoadComplete, bootFailed, bootAttempt]);

  // WebGL unavailable screen
  if (bootFailed) {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-background">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="mb-6 text-6xl">🌫️</div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            3D unavailable
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your browser couldn&apos;t create a WebGL context, which this world
            needs to render. Make sure &quot;Use graphics acceleration when
            available&quot; is enabled in your browser&apos;s system settings
            (it also enables software rendering), then relaunch the browser.
            Closing other GPU-heavy tabs can help too.
          </p>
          <button
            onClick={() => {
              setBootFailed(false);
              setBootAttempt((attempt) => attempt + 1);
            }}
            className="mt-6 rounded-full border px-5 py-2 text-sm font-medium transition-colors hover:bg-secondary/50"
          >
            Try again
          </button>
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
      <WorldLoader
        progress={loadProgress}
        isLoaded={isLoaded}
      />

      <HudCluster
        gameRef={gameRef}
        isLoaded={isLoaded}
        onOpenTab={setMenuTab}
      />

      {/* Touch movement controls */}
      {isMobile && isLoaded && !menuTab && <TouchControls gameRef={gameRef} />}

      {/* Pause menu */}
      {menuTab && (
        <WorldMenu
          tab={menuTab}
          onTabChange={setMenuTab}
          onClose={() => setMenuTab(null)}
          gameRef={gameRef}
          isLoaded={isLoaded}
          onRebootGame={rebootGame}
        />
      )}

      {/* Three.js canvas */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 touch-none outline-none"
        style={{ cursor: "grab", overscrollBehavior: "none" }}
        tabIndex={0}
        onPointerDown={(e) => e.currentTarget.focus()}
      />
    </div>
  );
}
