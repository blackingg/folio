"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface InfiniteWorldProps {
  className?: string;
}

export default function InfiniteWorld({ className }: InfiniteWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent page scroll & navbar shortcuts while 3D is active
  useEffect(() => {
    const preventDefaults = (e: KeyboardEvent) => {
      const gameKeys = [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "Space",
        "ShiftLeft",
        "ShiftRight",
        "KeyV",
        "KeyB",
        "KeyF",
        "KeyL",
      ];
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventDefaults);
    return () => window.removeEventListener("keydown", preventDefaults);
  }, []);

  const handleLoadProgress = useCallback((progress: number) => {
    setLoadProgress(progress);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Initialize game engine
  useEffect(() => {
    const shouldBlock = isMobile && process.env.NODE_ENV !== "development";
    if (!containerRef.current || shouldBlock) return;

    let destroyed = false;

    const initGame = async () => {
      const { default: Game } = await import("@/lib/infinite-world/Game.js");

      if (destroyed || !containerRef.current) return;

      gameRef.current = new Game(
        containerRef.current,
        handleLoadProgress,
        handleLoadComplete
      );
    };

    initGame();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [isMobile, handleLoadProgress, handleLoadComplete]);

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
      {/* Loading overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-1000 ${
          isLoaded
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          </div>
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

      {/* Controls HUD */}
      <div
        className={`fixed bottom-20 left-4 z-40 flex flex-col gap-2 transition-all duration-700 ${
          isLoaded
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <div className="rounded-xl border border-border/50 bg-background/60 px-4 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-border/80 bg-muted/50 font-mono text-[10px]">
                  W
                </kbd>
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-border/80 bg-muted/50 font-mono text-[10px]">
                  A
                </kbd>
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-border/80 bg-muted/50 font-mono text-[10px]">
                  S
                </kbd>
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-border/80 bg-muted/50 font-mono text-[10px]">
                  D
                </kbd>
              </div>
              <span>Move</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">🖱️</span>
              <span>Look around</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-border/80 bg-muted/50 px-1.5 font-mono text-[10px]">
                V
              </kbd>
              <span>Toggle camera</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-border/80 bg-muted/50 px-1.5 font-mono text-[10px]">
                Shift
              </kbd>
              <span>Boost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0"
        style={{ cursor: "grab" }}
      />
    </div>
  );
}
