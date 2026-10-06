"use client";

import { useEffect, useMemo, useRef } from "react";

const LINE_COUNT = 46;

interface Wedge {
  points: string;
  opacity: number;
}

// Tapered polygon wedges radiating from the focal point — comic/manga speed
// line convention — rather than a uniform-width ray. Randomized once per
// mount so the pattern isn't a mechanically even hatch.
function generateWedges(count: number): Wedge[] {
  const cx = 50;
  const cy = 50;
  const wedges: Wedge[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.22;
    const innerR = 7 + Math.random() * 9;
    const outerR = 58 + Math.random() * 40;
    const tip = 0.12 + Math.random() * 0.1;
    const base = 0.7 + Math.random() * 1.9;

    const ix = cx + Math.cos(angle) * innerR;
    const iy = cy + Math.sin(angle) * innerR;
    const ox = cx + Math.cos(angle) * outerR;
    const oy = cy + Math.sin(angle) * outerR;
    const px = -Math.sin(angle);
    const py = Math.cos(angle);

    const p1 = [ix + px * tip, iy + py * tip];
    const p2 = [ix - px * tip, iy - py * tip];
    const p3 = [ox - px * base, oy - py * base];
    const p4 = [ox + px * base, oy + py * base];

    wedges.push({
      points: [p1, p4, p3, p2].map((p) => p.join(",")).join(" "),
      opacity: 0.28 + Math.random() * 0.5,
    });
  }

  return wedges;
}

// Reads the camera's own FOV easing (View/Camera.js's boost kick) every
// frame instead of tracking the boost key separately, so the lines fade in
// and out exactly in step with the same easing curve the FOV uses.
export function BoostLines({ gameRef }: { gameRef: React.RefObject<any> }) {
  const elRef = useRef<HTMLDivElement>(null);
  const wedges = useMemo(() => generateWedges(LINE_COUNT), []);

  useEffect(() => {
    let frame: number;

    const tick = () => {
      const camera = gameRef.current?.view?.camera;
      const el = elRef.current;

      if (camera?.instance && el) {
        const { baseFov, boostFov, instance } = camera;
        const t = Math.min(
          1,
          Math.max(0, (instance.fov - baseFov) / (boostFov - baseFov)),
        );
        el.style.opacity = String(t);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [gameRef]);

  return (
    <div ref={elRef} className="pointer-events-none fixed inset-0 z-10 opacity-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {wedges.map((w, i) => (
          <polygon key={i} points={w.points} fill="hsl(var(--foreground))" opacity={w.opacity} />
        ))}
      </svg>
    </div>
  );
}
