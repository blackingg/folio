"use client";

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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h3>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground">
      {children}
    </kbd>
  );
}

export function GuideSection() {
  return (
    <div className="flex flex-col gap-7">
      <div className="grid gap-7 md:grid-cols-2">
        <section>
          <SectionHeading>Keyboard</SectionHeading>
          <div className="grid grid-cols-1 gap-2">
            {CONTROLS.map(({ keys, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex gap-1.5">
                  {keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading>Gamepad</SectionHeading>
          <div className="grid grid-cols-1 gap-2">
            {GAMEPAD.map(([input, action]) => (
              <div
                key={input}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{action}</span>
                <Kbd>{input}</Kbd>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            USB and Bluetooth controllers are supported (Xbox, PlayStation,
            Switch Pro, and similar). Pick your active pad in Settings.
          </p>
        </section>
      </div>

      <section>
        <SectionHeading>Under the hood</SectionHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-secondary/50 p-4 md:grid-cols-3">
          {TECH.map(([key, val]) => (
            <div key={key}>
              <p className="text-xs text-muted-foreground">{key}</p>
              <p className="text-sm text-foreground">{val}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
