"use client";

import { useState } from "react";
import { PanelBackdrop } from "./PanelBackdrop";
import { PanelContainer } from "./PanelContainer";
import { PanelTabs } from "./PanelTabs";

const CONTROLS = [
  { keys: ["W", "A", "S", "D"], label: "Move" },
  { keys: ["Mouse"], label: "Look / Rotate camera" },
  { keys: ["Shift"], label: "Boost speed" },
  { keys: ["V"], label: "Toggle 3rd / Fly camera" },
];

const GAMEPAD: [string, string][] = [
  ["L-Stick", "Move"],
  ["R-Stick", "Rotate camera"],
  ["LB / RT", "Boost speed"],
];

const TECH: [string, string][] = [
  ["Engine", "Three.js (vanilla)"],
  ["Architecture", "Singleton OO"],
  ["Terrain", "Procedural FBM noise"],
  ["LOD", "Quadtree chunk system"],
  ["Trees", "InstancedMesh + GLTF"],
  ["Lighting", "Custom sky shader"],
];

const TABS = [
  { id: "keyboard", label: "Keyboard" },
  { id: "gamepad", label: "Gamepad" },
  { id: "technical", label: "Technical" },
] as const;

export function InfoPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("keyboard");

  return (
    <>
      <PanelBackdrop onClose={onClose} />
      <PanelContainer
        title="About This World"
        subtitle="Controls & technical details"
        onClose={onClose}
      >
        <PanelTabs tabs={[...TABS]} active={activeTab} onChange={setActiveTab} />

        {activeTab === "keyboard" && (
          <div className="grid grid-cols-1 gap-2">
            {CONTROLS.map(({ keys, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex gap-1.5">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "gamepad" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-2">
              {GAMEPAD.map(([input, action]) => (
                <div
                  key={input}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
                >
                  <span className="text-sm text-muted-foreground">{action}</span>
                  <kbd className="inline-flex items-center justify-center rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-foreground">
                    {input}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              USB and Bluetooth controllers are supported (Xbox, PlayStation,
              Switch Pro, and similar). Pick your active pad in Settings.
            </p>
          </div>
        )}

        {activeTab === "technical" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-secondary/50 p-4">
            {TECH.map(([key, val]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="text-sm text-foreground">{val}</p>
              </div>
            ))}
          </div>
        )}
      </PanelContainer>
    </>
  );
}
