"use client";

import { useRef } from "react";
import { Zap } from "lucide-react";

// Knob travel radius in px — matches the 9rem base (144px) minus knob size.
const JOYSTICK_RADIUS = 48;
const DEADZONE = 0.15;

export function TouchControls({ gameRef }: { gameRef: React.RefObject<any> }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Direct engine mutation each move — no React state per frame.
  const setMove = (x: number, z: number, active: boolean) => {
    const move = gameRef.current?.state?.controls?.move;
    if (!move) return;
    move.x = x;
    move.z = z;
    move.active = active;
  };

  const updateKnob = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;
    const rect = base.getBoundingClientRect();
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > JOYSTICK_RADIUS) {
      dx *= JOYSTICK_RADIUS / dist;
      dy *= JOYSTICK_RADIUS / dist;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / JOYSTICK_RADIUS;
    const ny = dy / JOYSTICK_RADIUS;
    // Screen up = forward (+z)
    setMove(nx, -ny, Math.hypot(nx, ny) > DEADZONE);
  };

  const releaseKnob = () => {
    pointerIdRef.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    setMove(0, 0, false);
  };

  const setBoost = (down: boolean) => {
    const keys = gameRef.current?.state?.controls?.keys;
    if (keys) keys.down.boost = down;
  };

  return (
    <>
      {/* Movement joystick */}
      <div
        ref={baseRef}
        className="fixed bottom-24 left-5 z-20 flex h-36 w-36 touch-none select-none items-center justify-center rounded-full border border-border/60 bg-secondary/30 backdrop-blur-sm"
        onPointerDown={(e) => {
          e.stopPropagation();
          pointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKnob(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.pointerId !== pointerIdRef.current) return;
          e.stopPropagation();
          updateKnob(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (e.pointerId !== pointerIdRef.current) return;
          e.stopPropagation();
          releaseKnob();
        }}
        onPointerCancel={releaseKnob}
      >
        <div
          ref={knobRef}
          className="h-14 w-14 rounded-full border border-border bg-foreground/80 shadow-lg transition-transform duration-75"
        />
      </div>

      {/* Boost button */}
      <button
        type="button"
        aria-label="Boost"
        className="fixed bottom-24 right-5 z-20 flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border border-border/60 bg-secondary/30 text-foreground backdrop-blur-sm active:bg-secondary/70 landscape:bottom-10 landscape:right-24"
        onPointerDown={(e) => {
          e.stopPropagation();
          setBoost(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setBoost(false);
        }}
        onPointerLeave={() => setBoost(false)}
        onPointerCancel={() => setBoost(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Zap className="h-6 w-6" />
      </button>
    </>
  );
}
