"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Map as MapIcon, Moon, Settings, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorldMap } from "./map/WorldMap";
import { GATE_ANGLE, borderRadiusAt } from "./map/border";
import { GuideSection } from "./sections/GuideSection";
import { SettingsSection } from "./sections/SettingsSection";

export type MenuTab = "map" | "guide" | "settings";

const GATE_R = borderRadiusAt(GATE_ANGLE);
const GATE_X = Math.cos(GATE_ANGLE) * GATE_R;
const GATE_Z = Math.sin(GATE_ANGLE) * GATE_R;

const NAV: Array<{
  id: MenuTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
  blurb: string;
}> = [
  {
    id: "map",
    label: "Map",
    icon: MapIcon,
    hint: "1",
    blurb: "Topographic chart of the world — hover a marker for details",
  },
  {
    id: "guide",
    label: "Guide",
    icon: BookOpen,
    hint: "2",
    blurb: "Controls, and how this world is built",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    hint: "3",
    blurb: "Tune movement, controller and graphics",
  },
];

interface WorldStatus {
  x: number;
  z: number;
  inWilds: boolean;
  gateDist: number;
  hour24: number;
}

interface WorldMenuProps {
  tab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
  onClose: () => void;
  gameRef: React.RefObject<any>;
  isLoaded: boolean;
  onRebootGame?: () => void;
}

export function WorldMenu({
  tab,
  onTabChange,
  onClose,
  gameRef,
  isLoaded,
  onRebootGame,
}: WorldMenuProps) {
  const [status, setStatus] = useState<WorldStatus | null>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const [mapSide, setMapSide] = useState(0);

  // Number-key section switching, console-menu style
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      const idx = ["Digit1", "Digit2", "Digit3"].indexOf(e.code);
      if (idx !== -1) onTabChange(NAV[idx].id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTabChange]);

  // Live status bar — player position, wilds state, in-world clock
  useEffect(() => {
    const read = () => {
      const state = gameRef.current?.state;
      const pos = state?.player?.position?.current;
      if (!pos) return;
      const x = pos[0];
      const z = pos[2];
      const dist = Math.hypot(x, z);
      const theta = Math.atan2(z, x);
      // day progress 0 = noon, 0.5 = midnight (see State/Sun.js)
      const progress = state?.day?.progress ?? 0;
      setStatus({
        x,
        z,
        inWilds: dist > borderRadiusAt(theta) + 6,
        gateDist: Math.hypot(GATE_X - x, GATE_Z - z),
        hour24: (progress * 24 + 12) % 24,
      });
    };
    read();
    const id = window.setInterval(read, 300);
    return () => window.clearInterval(id);
  }, [gameRef]);

  // The map is a square canvas — fit it to the largest square the content
  // area allows so hit-testing stays uniform in both axes
  useEffect(() => {
    if (tab !== "map") return;
    const el = mapBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setMapSide(Math.floor(Math.min(rect.width, rect.height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  const active = NAV.find((n) => n.id === tab) ?? NAV[0];
  const hour = status ? Math.floor(status.hour24) : 12;
  const minute = status ? Math.floor((status.hour24 % 1) * 60) : 0;
  const isDaytime = hour >= 6 && hour < 18;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const meridiem = hour < 12 ? "AM" : "PM";

  return (
    <div className="fixed inset-0 z-50">
      {/* Light glass — the world stays visible and alive behind the menu */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 200ms ease" }}
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <div
          className="pointer-events-auto flex h-[min(85vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card/85 shadow-2xl backdrop-blur-xl"
          style={{ animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <div className="flex min-h-0 flex-1">
            {/* Nav rail */}
            <nav className="flex w-44 flex-shrink-0 flex-col border-r border-border bg-secondary/30 p-3">
              <p className="px-2 pb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                World paused
              </p>

              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === tab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Icon className="size-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {item.hint}
                    </kbd>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onClose}
                className="mt-auto flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Resume
                <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  Esc
                </kbd>
              </button>
            </nav>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-start justify-between px-6 pb-4 pt-5">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {active.label === "Guide" ? "About This World" : active.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {active.blurb}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div
                key={tab}
                className={cn(
                  "min-h-0 flex-1 px-6 pb-6 animate-in fade-in slide-in-from-bottom-1 duration-200",
                  tab === "map" ? "overflow-hidden" : "overflow-y-auto"
                )}
              >
                {tab === "map" && (
                  <div
                    ref={mapBoxRef}
                    className="flex h-full items-center justify-center"
                  >
                    {mapSide > 0 && (
                      <div
                        className="overflow-hidden rounded-lg border border-border"
                        style={{ width: mapSide, height: mapSide }}
                      >
                        <WorldMap
                          gameRef={gameRef}
                          isLoaded={isLoaded}
                          size={640}
                          mode="full"
                          className="h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
                {tab === "guide" && <GuideSection />}
                {tab === "settings" && (
                  <SettingsSection gameRef={gameRef} onRebootGame={onRebootGame} />
                )}
              </div>
            </div>
          </div>

          {/* Status bar — live world telemetry */}
          <footer className="flex items-center justify-between gap-4 border-t border-border bg-secondary/30 px-4 py-2 text-xs">
            <span className="font-mono text-muted-foreground">
              {status
                ? `x ${Math.round(status.x)} · z ${Math.round(status.z)}`
                : "—"}
            </span>
            {status?.inWilds ? (
              <span className="font-medium text-amber-500">
                Beyond the wall · Gate {Math.round(status.gateDist)}m
              </span>
            ) : (
              <span className="text-muted-foreground">Within the walls</span>
            )}
            <span
              className="flex items-center gap-1.5 text-muted-foreground"
              title="In-world time — a full day here lasts 30 real minutes"
            >
              {isDaytime ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )}
              <span className="font-mono">
                {hour12}:{String(minute).padStart(2, "0")} {meridiem}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] opacity-70">
                in-world
              </span>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
