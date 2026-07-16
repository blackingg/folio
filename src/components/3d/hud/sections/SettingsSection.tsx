"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectedGamepad {
  index: number;
  id: string;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h3>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hud-range w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, hsl(var(--foreground)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
        }}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 text-left transition-colors hover:bg-secondary"
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all duration-200",
            value ? "left-[calc(100%-22px)]" : "left-0.5"
          )}
        />
      </div>
    </button>
  );
}

const DEFAULTS = {
  moveSpeed: 10,
  boostSpeed: 30,
  fogEnabled: true,
  lookSensitivity: 0.03,
};

function shortGamepadName(id: string) {
  const trimmed = id.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}

export function SettingsSection({
  gameRef,
}: {
  gameRef: React.RefObject<any>;
}) {
  const [moveSpeed, setMoveSpeed] = useState(DEFAULTS.moveSpeed);
  const [boostSpeed, setBoostSpeed] = useState(DEFAULTS.boostSpeed);
  const [fogEnabled, setFogEnabled] = useState(DEFAULTS.fogEnabled);
  const [lookSensitivity, setLookSensitivity] = useState(DEFAULTS.lookSensitivity);
  const [gamepads, setGamepads] = useState<ConnectedGamepad[]>([]);
  const [selectedGamepad, setSelectedGamepad] = useState<string>("auto");

  useEffect(() => {
    const player = gameRef.current?.state?.player;
    const gamepad = gameRef.current?.state?.gamepad;

    if (player) {
      setMoveSpeed(player.inputSpeed ?? DEFAULTS.moveSpeed);
      setBoostSpeed(player.inputBoostSpeed ?? DEFAULTS.boostSpeed);
    }

    if (gamepad) {
      setLookSensitivity(gamepad.lookSensitivity ?? DEFAULTS.lookSensitivity);
      setSelectedGamepad(
        gamepad.preferredIndex === null ? "auto" : String(gamepad.preferredIndex)
      );
    }
  }, [gameRef]);

  useEffect(() => {
    const refreshGamepads = () => {
      const gamepad = gameRef.current?.state?.gamepad;
      if (!gamepad) return;
      setGamepads(gamepad.getConnectedGamepads());
    };

    refreshGamepads();
    const interval = window.setInterval(refreshGamepads, 1000);
    window.addEventListener("gamepadconnected", refreshGamepads);
    window.addEventListener("gamepaddisconnected", refreshGamepads);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("gamepadconnected", refreshGamepads);
      window.removeEventListener("gamepaddisconnected", refreshGamepads);
    };
  }, [gameRef]);

  const applySpeed = (speed: number, boost: number) => {
    const player = gameRef.current?.state?.player;
    if (player) {
      player.inputSpeed = speed;
      player.inputBoostSpeed = boost;
    }
  };

  const applyGamepadSelection = (value: string) => {
    setSelectedGamepad(value);
    const gamepad = gameRef.current?.state?.gamepad;
    if (!gamepad) return;
    gamepad.setPreferredGamepad(value === "auto" ? null : Number(value));
  };

  const applyLookSensitivity = (value: number) => {
    setLookSensitivity(value);
    const gamepad = gameRef.current?.state?.gamepad;
    if (gamepad) gamepad.setLookSensitivity(value);
  };

  const resetDefaults = () => {
    setMoveSpeed(DEFAULTS.moveSpeed);
    setBoostSpeed(DEFAULTS.boostSpeed);
    setFogEnabled(DEFAULTS.fogEnabled);
    setLookSensitivity(DEFAULTS.lookSensitivity);
    setSelectedGamepad("auto");
    applySpeed(DEFAULTS.moveSpeed, DEFAULTS.boostSpeed);
    applyLookSensitivity(DEFAULTS.lookSensitivity);
    applyGamepadSelection("auto");
  };

  const activeGamepad =
    selectedGamepad === "auto"
      ? gamepads[0]
      : gamepads.find((gp) => String(gp.index) === selectedGamepad);

  return (
    <div className="flex max-w-xl flex-col gap-7">
      <section>
        <SectionHeading>Movement</SectionHeading>
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Walk Speed"
            value={moveSpeed}
            min={2}
            max={30}
            step={1}
            format={(v) => `${v}`}
            onChange={(v) => {
              setMoveSpeed(v);
              applySpeed(v, boostSpeed);
            }}
          />
          <SliderRow
            label="Boost Speed"
            value={boostSpeed}
            min={10}
            max={80}
            step={5}
            format={(v) => `${v}`}
            onChange={(v) => {
              setBoostSpeed(v);
              applySpeed(moveSpeed, v);
            }}
          />
        </div>
      </section>

      <section>
        <SectionHeading>Controller</SectionHeading>
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="gamepad-select"
              className="mb-2 block text-sm text-muted-foreground"
            >
              Active Controller
            </label>
            <select
              id="gamepad-select"
              value={selectedGamepad}
              onChange={(e) => applyGamepadSelection(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            >
              <option value="auto">Auto (first connected)</option>
              {gamepads.map((gp) => (
                <option key={gp.index} value={String(gp.index)}>
                  {shortGamepadName(gp.id)}
                </option>
              ))}
            </select>
          </div>

          <SliderRow
            label="Camera Sensitivity"
            value={lookSensitivity}
            min={0.01}
            max={0.08}
            step={0.005}
            format={(v) => v.toFixed(3)}
            onChange={applyLookSensitivity}
          />

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {gamepads.length === 0 ? (
              <p>
                No controller detected. Pair a USB or Bluetooth gamepad, then
                press any button so your browser can see it.
              </p>
            ) : (
              <p>
                Using{" "}
                <span className="font-medium text-foreground">
                  {activeGamepad ? shortGamepadName(activeGamepad.id) : "—"}
                </span>
                . Bluetooth controllers (Xbox, PlayStation, Switch Pro, etc.)
                are supported through the browser Gamepad API.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading>Graphics</SectionHeading>
        <ToggleRow
          label="Distance Fog"
          description="Atmospheric fog at horizon"
          value={fogEnabled}
          onChange={setFogEnabled}
        />
      </section>

      <div className="flex justify-end border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={resetDefaults}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
