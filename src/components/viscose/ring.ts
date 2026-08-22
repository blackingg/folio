// Ring maths and easing helpers, kept out of the component so the frame loop
// reads as physics rather than trigonometry.

export const TAU = Math.PI * 2;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

// Relaxation toward a target. Rates in this folder are authored per 60fps
// frame and corrected for real frame time here.
export const chase = (dt: number, rate: number) => 1 - Math.pow(1 - rate, dt * 60);

// Shortest signed distance around a ring of `n` slots, so the last project
// sits one slot left of the first rather than n-1 slots right.
export const wrapDelta = (d: number, n: number) => {
  const h = n / 2;
  let x = ((d % n) + n) % n;
  if (x > h) x -= n;
  return x;
};

// Fan order for the entry: the seed alone in the middle, the rest peeling off
// alternating right, left, right.
//
// This orders the *animation* only. Artwork is dealt by ring slot — dealing by
// fan order makes one turn of the wheel step two names.
export const fanOrder = (slot: number) =>
  slot === 0 ? 0 : slot > 0 ? slot * 2 - 1 : -slot * 2;

// Each card holds at the seed until its turn, then runs its own eased spread.
export function fanProgress(entry: number, order: number, maxOrder: number, stagger: number) {
  const span = 1 / (1 + stagger * maxOrder);
  const start = order * stagger * span;
  return easeOutCubic(clamp01((entry - start) / span));
}
