"use client";

import { ArrowUpRight } from "lucide-react";
import { DATA } from "@/data/resume";

const CONTROLS = [
  { keys: ["W", "A", "S", "D"], label: "Move" },
  { keys: ["Mouse"], label: "Look / Rotate camera" },
  { keys: ["Shift"], label: "Boost speed" },
  { keys: ["V"], label: "Toggle 3rd / Fly camera" },
  { keys: ["Space"], label: "Swim up / Fly up" },
  { keys: ["Ctrl", "C"], label: "Swim down / Fly down" },
];

const GAMEPAD: [string, string][] = [
  ["L-Stick", "Move"],
  ["R-Stick", "Rotate camera"],
  ["LB / RT", "Boost speed"],
  ["A / Cross", "Swim up / Fly up"],
  ["B / Circle", "Swim down / Fly down"],
];

const TOUCH: [string, string][] = [
  ["Joystick", "Move"],
  ["Drag", "Rotate camera"],
  ["⚡ Button", "Boost speed"],
  ["⬆ Button", "Swim up / Fly up"],
  ["⬇ Button", "Swim down / Fly down"],
];

const VR: [string, string][] = [
  ["L-Stick", "Move where you look"],
  ["R-Stick", "Snap turn 45°"],
  ["Trigger / Grip", "Boost speed"],
  ["A / X", "Swim up / Fly up"],
  ["B / Y", "Swim down / Fly down"],
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

        <section>
          <SectionHeading>Touch</SectionHeading>
          <div className="grid grid-cols-1 gap-2">
            {TOUCH.map(([input, action]) => (
              <div
                key={input}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{action}</span>
                <Kbd>{input}</Kbd>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading>VR Headset</SectionHeading>
          <div className="grid grid-cols-1 gap-2">
            {VR.map(([input, action]) => (
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
            On a headset browser (Quest and similar), use the Enter VR button
            in the corner. Switch to smooth turning in Settings.
          </p>
        </section>
      </div>

      <section>
        <SectionHeading>About the Creator</SectionHeading>
        <a
          href={DATA.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-4 transition-colors hover:bg-secondary"
        >
          <img
            src={DATA.avatarUrl}
            alt={DATA.name}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{DATA.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {DATA.description}
            </p>
          </div>
          <ArrowUpRight className="size-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        </a>
      </section>
    </div>
  );
}
