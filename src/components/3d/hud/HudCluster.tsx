"use client";

import { BookOpen, Settings } from "lucide-react";
import { HudButton } from "./HudButton";
import { WorldMap } from "./map/WorldMap";
import type { MenuTab } from "./WorldMenu";

interface HudClusterProps {
  gameRef: React.RefObject<any>;
  isLoaded: boolean;
  onOpenTab: (tab: MenuTab) => void;
}

export function HudCluster({ gameRef, isLoaded, onOpenTab }: HudClusterProps) {
  return (
    <div
      className={`fixed right-4 top-4 z-40 flex flex-col items-end gap-3 transition-all duration-700 ${
        isLoaded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpenTab("map")}
        className="group overflow-hidden rounded-lg border border-1 bg-card transition-colors hover:bg-secondary/50 p-1"
        title="Open map (M)"
      >
        <WorldMap
          gameRef={gameRef}
          isLoaded={isLoaded}
          size={144}
          mode="minimap"
          interactive={false}
        />
      </button>

      <HudButton
        id="hud-info-toggle"
        icon={<BookOpen className="size-5" />}
        label="Guide"
        onClick={() => onOpenTab("guide")}
      />
      <HudButton
        id="hud-settings-toggle"
        icon={<Settings className="size-5" />}
        label="Settings"
        onClick={() => onOpenTab("settings")}
      />
    </div>
  );
}
