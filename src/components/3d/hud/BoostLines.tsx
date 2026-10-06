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

// Gated by two signals: the camera's own FOV easing (View/Camera.js's boost
// kick) so the lines fade in/out on the same curve as the FOV, AND the
// player's actual velocity so holding boost while stationary (e.g. facing a
// wall, or with no movement key down) doesn't still show full-intensity
// lines — the effect should track how fast you're actually going, not just
// whether the boost key is held.
export function BoostLines({ gameRef }: { gameRef: React.RefObject<any> }) {
  const elRef = useRef<HTMLDivElement>(null);
  const wedges = useMemo(() => generateWedges(LINE_COUNT), []);

  useEffect(() => {
    let frame: number;

    const tick = () => {
      const state = gameRef.current?.state;
      const camera = gameRef.current?.view?.camera;
      const player = state?.player;
      const time = state?.time;
      const el = elRef.current;

      if (camera?.instance && player && time && el) {
        const { baseFov, boostFov, instance } = camera;
        const fovT = Math.min(
          1,
          Math.max(0, (instance.fov - baseFov) / (boostFov - baseFov)),
        );

        const actualSpeed = time.delta > 0 ? player.speed / time.delta : 0;
        const speedT = Math.min(1, actualSpeed / player.inputBoostSpeed);

        el.style.opacity = String(fovT * speedT);
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
