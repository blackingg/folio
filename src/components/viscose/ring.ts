// Ring maths and the small easing helpers the carousel loop leans on.
// Kept out of the component so the layout is testable in isolation and the
// frame loop reads as physics rather than trigonometry.

export const TAU = Math.PI * 2;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

// Relaxation toward a target. Every rate in this folder is authored per
// 60fps frame and corrected for real frame time here, so the feel holds on a
// 120Hz laptop and a throttled phone alike.
export const chase = (dt: number, rate: number) => 1 - Math.pow(1 - rate, dt * 60);

// Shortest signed distance around a ring of `n` slots. Wrapping through here
// rather than through a raw modulo is what lets the last project sit one slot
// to the left of the first instead of seventeen slots to the right.
export const wrapDelta = (d: number, n: number) => {
  const h = n / 2;
  let x = ((d % n) + n) % n;
  if (x > h) x -= n;
  return x;
};

// Fan order for the entry. The seed is born alone in the middle and the rest
// peel off alternating right, left, right — so slot +1 leaves before slot -1
// and the ring draws itself outward from the centre.
//
// This orders the *animation* only. Artwork is dealt by ring slot: dealing by
// fan order is what quietly puts every other project side by side and makes
// one turn of the wheel step two names.
export const fanOrder = (slot: number) =>
  slot === 0 ? 0 : slot > 0 ? slot * 2 - 1 : -slot * 2;

// Per-card entry progress. Each card holds at the seed until its turn comes
// round, then runs its own eased spread inside the shared timeline.
export function fanProgress(entry: number, order: number, maxOrder: number, stagger: number) {
  const span = 1 / (1 + stagger * maxOrder);
  const start = order * stagger * span;
  return easeOutCubic(clamp01((entry - start) / span));
}
