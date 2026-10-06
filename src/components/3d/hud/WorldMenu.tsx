"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Map as MapIcon, Moon, Settings, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HudButton } from "./HudButton";
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
    <div className="fixed inset-0 z-[60]">
      {/* Light glass — the world stays visible and alive behind the menu */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 200ms ease" }}
        onClick={onClose}
      />

      {/* Desktop dock — takes over HudCluster's top-right slot while paused */}
      <div
        className="pointer-events-auto absolute right-4 top-4 z-10 hidden flex-col items-end gap-3 md:flex"
        style={{ animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {NAV.map((item) => (
          <HudButton
            key={item.id}
            id={`world-menu-${item.id}`}
            icon={<item.icon className="size-5" />}
            label={`${item.label} · ${item.hint}`}
            onClick={() => (item.id === tab ? onClose() : onTabChange(item.id))}
            active={item.id === tab}
          />
        ))}
        <HudButton
          id="world-menu-resume"
          icon={<X className="size-5" />}
          label="Resume · Esc"
          onClick={onClose}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-4 sm:pb-6 md:justify-center md:pb-4">
        {/* Flyout panel */}
        <div
          className="pointer-events-auto flex max-h-[min(65dvh,560px)] w-full max-w-2xl min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-xl md:max-h-[min(80dvh,640px)] md:max-w-3xl"
          style={{ animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <header className="flex items-start justify-between px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {active.label === "Guide" ? "About Project TRUMAN" : active.label}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {active.blurb}
              </p>
            </div>
          </header>

          <div
            key={tab}
            className={cn(
              "min-h-0 flex-1 px-4 pb-4 animate-in fade-in slide-in-from-bottom-1 duration-200 sm:px-6 sm:pb-6",
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

          {/* Status bar — live world telemetry */}
          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-secondary/30 px-4 py-2 text-xs sm:px-6">
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

        {/* Mobile dock — bottom-center, thumb reach. Desktop gets the top-right dock above instead. */}
        <div
          className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-xl sm:gap-2.5 sm:p-2.5 md:hidden"
          style={{ animation: "slideUp 300ms cubic-bezier(0.34,1.56,0.64,1) 40ms both" }}
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                title={`${item.label} · ${item.hint}`}
                onClick={() => (isActive ? onClose() : onTabChange(item.id))}
                className={cn(
                  "relative flex size-14 flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-150 sm:size-16",
                  isActive
                    ? "-translate-y-1.5 border-[hsl(var(--neon)/50%)] bg-secondary text-foreground shadow-lg shadow-[hsl(var(--neon)/10%)]"
                    : "border-transparent text-muted-foreground hover:-translate-y-1 hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="size-5 sm:size-6" />
                <span className="text-[10px] font-medium sm:text-xs">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-2 h-1 w-1 rounded-full bg-[hsl(var(--neon))] transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}

          <div className="mx-0.5 h-10 w-px bg-border sm:h-12" />

          <button
            type="button"
            title="Resume · Esc"
            onClick={onClose}
            className="flex size-14 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:size-16"
          >
            <X className="size-5 sm:size-6" />
            <span className="text-[10px] font-medium sm:text-xs">Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
