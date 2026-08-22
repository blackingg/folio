"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildAtlas, type Atlas, type CellPainter } from "./atlas";
import {
  chase,
  clamp,
  clamp01,
  fanOrder,
  fanProgress,
  smoothstep,
  wrapDelta,
} from "./ring";
import { FRAGMENT, MAX_CARDS, VERTEX } from "./shaders";
import type { FullPageProps } from "@/components/full-page-scroll";
import { cn } from "@/lib/utils";

export type ViscoseProject = {
  title: string;
  href?: string;
  dates: string;
  description: string;
  technologies: readonly string[];
  image?: string;
  links?: readonly { type: string; href: string }[];
  /** Renders this slot as a drawn tile rather than a screenshot — used for
   *  the card that ends the homepage ring and opens /projects. */
  poster?: { label: string };
  /** Route in-app rather than opening a tab. */
  internal?: boolean;
};

/**
 * Everything tunable, in one place.
 *
 * Distances are CSS px unless noted; anything derived from the card's long
 * edge is written as a multiple of it, so the ring re-proportions on a phone
 * rather than merely shrinking.
 */
const TUNE = {
  aspect: 1.5, // card long : short
  gap: 1.32, // slot spacing, in short edges — the ring stacks vertically
  // Big on purpose. A tight radius leans each card over like a conveyor;
  // what you want is a few degrees, so the arc reads as a slice of something
  // much larger passing by rather than a wheel you can see all of.
  arcRadius: 4.0, // x container height
  arcMin: 2400,
  // The ring sits right of centre by a fraction of the *column*, not of the
  // viewport: keyed off the viewport it keeps walking rightward on a wide
  // monitor and leaves the type stranded on its own.
  column: 768, // px, matches the layout's max-w-3xl
  sideShift: 0.28, // fraction of the column, "column" layout
  // "full" layout puts the ring left of centre and gives the whole right
  // side over to the detail panel, so the shift is negative and keyed off
  // the viewport rather than a column that isn't there.
  fullShift: 0.16, // fraction of the viewport, "full" layout
  sideShiftFrom: 768, // px of width below which the ring re-centres instead
  window: 3, // slots either side of the front that reach the shader
  corner: 0.045, // x long edge
  k: 0.045, // base smin, x long edge — the viscosity of the whole world
  // Not a crossfade width — the art crossfade is scale-free now (see the
  // fragment shader). This is only the floor under the weights, and so how
  // tightly the pixels at a card face hold that card's own artwork.
  artFloor: 0.03, // x long edge
  depthScale: 0.2, // how much the arc's far cards shrink
  depthDim: 0.38,

  // entry
  entryTime: 2.5,
  stagger: 0.5,

  // scroll / drag
  //
  // A wheel tick is an impulse into a damped system, so what it is worth is
  // not `wheel` alone: total travel is v0 * dt / (1 - damping), i.e. v0/4.2
  // at 60fps with the damping below. These two are therefore tuned as a
  // pair, against one Chrome notch of deltaY 120 landing just under a slot.
  wheel: 0.032, // slots/s of velocity per px of wheel delta
  damping: 0.93, // velocity kept per 60fps frame
  maxSpeed: 20, // slots/s, so one flick cannot run away
  dragSpeed: 1.15,
  snapFrom: 1.2, // slots/s under which the ring commits to a slot
  snapRate: 0.1,
  pickRate: 0.14,

  // the honey between neighbours
  // At rest the neighbours sit `gap - 1` short edges apart, so
  // v = (gap - 1) / threadReach and the thread's width comes out as exactly
  // (1 - v)^threadFalloff of the card's long edge. At 1.32 / 0.55 / 2.2 that
  // is ~15% at the ends and ~7% through the neck: a thread, not a slab.
  threadReach: 0.55, // gap, in short edges, over which a thread survives
  threadFalloff: 2.2, // higher thins it faster off the edge
  pinch: 0.18, // how far the neck narrows relative to the ends
  dissolve: 0.7, // pushes the radius past zero so the thread breaks
  sag: 0.36,
  threadK: 0.02, // x long edge
  web: 0.22, // extra thread width where the cursor sits between two cards
  webReach: 0.9, // x long edge

  // the cursor, which is a force and not a pointer
  melt: 0.11, // x long edge, added to k at the cursor
  meltReach: 260,
  reach: 1.4, // lean falloff, in long edges
  swell: 0.08,
  pull: 0.075, // x long edge a card leans toward the cursor
  grab: 0.16, // how fast a card takes up a lean, per 60fps frame
  release: 0.055, // and how slowly it lets go — asymmetric on purpose
  sidePush: 0.06, // in slot units
  sideDim: 0.2,
  sideReach: 2.2, // in slots, measured from the hovered card
} as const;

const hueToRgb = (p: number, q: number, t: number) => {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
};

/**
 * Reads one of the theme's HSL tokens as raw sRGB.
 *
 * Raw on purpose: the shader writes straight to the framebuffer with no
 * encoding step, so the background it mixes toward has to sit in the same
 * space as the atlas it mixes from.
 */
function themeRgb(
  token: string,
  fallback: [number, number, number],
): [number, number, number] {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const m = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return fallback;
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hueToRgb(p, q, h + 1 / 3), hueToRgb(p, q, h), hueToRgb(p, q, h - 1 / 3)];
}

/**
 * Swaps a label when the front card changes. A plain fade and rise — the goo
 * belongs to the ring, not to the caption.
 *
 * Deliberately a keyed remount rather than an AnimatePresence with an exit.
 * `mode="wait"` holds the outgoing label until its exit finishes, so a flick
 * that crosses six projects in half a second queues swaps faster than they
 * can drain and the panel ends up describing a card that left the screen
 * seconds ago. Nothing to wait for here: the key changes, React remounts,
 * and the label is always the one under the ring.
 */
function Swap({
  value,
  delay = 0,
  children,
}: {
  value: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Draws a call-to-action tile straight into the atlas, so a slide with no
 * screenshot still behaves like every other card in the ring — it merges, it
 * strings honey, it snaps to front.
 *
 * Neon rather than a theme colour: --neon is the one token globals.css does
 * not redefine under .dark, and a canvas cell is baked the moment it is
 * drawn, so anything theme-bound would be wrong as soon as the toggle flips.
 */
function posterPainter(label: string, font: string, bg: string): CellPainter {
  return (ctx, x, y, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#0a0a0a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = Math.round(h * 0.14);
    ctx.font = `700 ${size}px ${font}`;
    while (ctx.measureText(label).width > w * 0.78 && size > 12) {
      size -= 2;
      ctx.font = `700 ${size}px ${font}`;
    }
    ctx.fillText(label, x + w / 2, y + h * 0.43);

    const cx = x + w / 2;
    const cy = y + h * 0.68;
    const r = h * 0.08;
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = Math.max(2, h * 0.017);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx + r * 0.4, cy - r * 0.5);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx + r * 0.4, cy + r * 0.5);
    ctx.stroke();
  };
}

type CardState = {
  leanX: number;
  leanY: number;
  swell: number;
  dim: number;
  push: number;
};

export function ViscoseCarousel({
  projects,
  heading,
  loop = true,
  compact = false,
  layout = "column",
  active = true,
  stepRef,
  fallback,
  className,
}: {
  projects: readonly ViscoseProject[];
  heading?: string;
  /** Full-page rings wrap; the homepage panel clamps, so its first and last
   *  slots can hand the gesture back to FullPageScroll. */
  loop?: boolean;
  compact?: boolean;
  /** "column" keeps the chrome inside the site's centred max-w-3xl and puts
   *  the ring to its right — the homepage panel. "full" spans the viewport,
   *  moves the ring left and gives the right side to a detail panel wide
   *  enough for a description. */
  layout?: "column" | "full";
  fallback?: React.ReactNode;
  className?: string;
} & FullPageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const [degraded, setDegraded] = useState(false);
  const [pointerFine, setPointerFine] = useState(false);

  const count = projects.length;

  // The frame loop talks to React through refs only: it must never re-create
  // itself because a label changed.
  const progressRef = useRef(0);
  const velRef = useRef(0);
  const entryRef = useRef(0);
  const entryOpenRef = useRef(false);
  const targetRef = useRef<number | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const router = useRouter();

  // Plain descriptors, not painters: the render loop keys off this array's
  // identity, and building closures here would tear down and rebuild the
  // renderer on every re-render. They become painters inside the effect.
  const sources = useMemo(
    () => projects.map((p) => p.poster ?? p.image ?? ""),
    [projects],
  );

  const open = useCallback(
    (i: number) => {
      const p = projects[i];
      if (!p?.href) return;
      if (p.internal) router.push(p.href);
      else window.open(p.href, "_blank", "noopener,noreferrer");
    },
    [projects, router],
  );

  // The gesture contract FullPageScroll hands every page. Returning false at
  // the ends is what lets the section flip on to Work, instead of trapping
  // the wheel inside a ring that never runs out.
  // Gated on `degraded`: a fallback that cannot step must not claim the
  // gesture, or the wheel is swallowed by a list that never moves and the
  // page below it never arrives.
  useEffect(() => {
    if (degraded) return;
    stepRef?.({
      step: (direction) => {
        const from = targetRef.current ?? progressRef.current;
        const next = Math.round(from) + direction;
        if (!loop && (next < 0 || next > count - 1)) return false;
        targetRef.current = next;
        velRef.current = 0;
        return true;
      },
    });
    return () => stepRef?.(null);
  }, [stepRef, loop, count, degraded]);

  // Re-arm the entry each time the section comes back into view, the same way
  // the story stepper used to reset to its first slide.
  useEffect(() => {
    if (!active) return;
    progressRef.current = 0;
    velRef.current = 0;
    entryRef.current = 0;
    targetRef.current = null;
    setFront(0);
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || count === 0) return;

    // Reduced motion means no *involuntary* motion — not no carousel. The
    // arc itself is a layout, and a still arc is no more animated than a
    // grid is. What goes is everything that moves without being asked: the
    // entry fan, the inertia after a flick, and every cursor force.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const fine = window.matchMedia("(pointer: fine)").matches;
    setPointerFine(fine);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false, // the distance field antialiases its own edge
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setDegraded(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5);
    renderer.setPixelRatio(dpr);

    const css = (c: [number, number, number]) =>
      `rgb(${c.map((v) => Math.round(v * 255)).join(",")})`;
    const font = getComputedStyle(host).fontFamily || "sans-serif";
    const neon = css(themeRgb("--neon", [1, 0.807, 0.286]));
    const muted = themeRgb("--muted", [0.94, 0.94, 0.94]);

    const atlas: Atlas = buildAtlas(
      sources.map((src) =>
        typeof src === "string" ? src : posterPainter(src.label, font, neon),
      ),
      css(muted),
      TUNE.aspect,
    );

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAtlas: { value: atlas.texture },
      uGrid: { value: new THREE.Vector2(atlas.grid[0], atlas.grid[1]) },
      uHalf: { value: new THREE.Vector2(1, 1) },
      uCorner: { value: 12 },
      uK: { value: 12 },
      uArtFloor: { value: 15 },
      uAA: { value: 1 / dpr },
      uCount: { value: 0 },
      uCardA: {
        value: Array.from({ length: MAX_CARDS }, () => new THREE.Vector4()),
      },
      uCardB: {
        value: Array.from({ length: MAX_CARDS }, () => new THREE.Vector4()),
      },
      uBridge: {
        value: Array.from({ length: MAX_CARDS }, () => new THREE.Vector4()),
      },
      uPointer: { value: new THREE.Vector2(1e5, 1e5) },
      uMelt: { value: 0 },
      uMeltReach: { value: TUNE.meltReach },
      uBg: { value: new THREE.Vector3(...themeRgb("--background", [1, 1, 1])) },
      uInk: { value: new THREE.Vector3(...muted) },
    };

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    );
    mesh.frustumCulled = false;
    scene.add(mesh);

    // Re-read the palette when the theme flips, rather than rebuilding the
    // renderer for a colour change.
    const themeObserver = new MutationObserver(() => {
      const bg = themeRgb("--background", [1, 1, 1]);
      const ink = themeRgb("--muted", [0.94, 0.94, 0.94]);
      uniforms.uBg.value.set(bg[0], bg[1], bg[2]);
      uniforms.uInk.value.set(ink[0], ink[1], ink[2]);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // -- geometry, recomputed on resize ------------------------------------
    let W = 1;
    let H = 1;
    let L = 300; // card long edge
    let hx = 150;
    let hy = 100;
    let arcR = 2000;
    let step = 0.13; // radians between slots
    let shiftX = 0;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      // A standing ring is bounded by height, not width: the card has to
      // leave room above and below for the neighbours it is about to pull
      // apart from.
      L = clamp(
        Math.min(W * 0.46, H * TUNE.aspect * (compact ? 0.4 : 0.44)),
        compact ? 170 : 200,
        compact ? 360 : 520,
      );
      hx = L / 2;
      hy = L / TUNE.aspect / 2;
      arcR = Math.max(H * TUNE.arcRadius, TUNE.arcMin);
      // Neighbours are stacked, so a slot is worth one short edge plus the
      // gap between them — not one long edge.
      step = (2 * hy * TUNE.gap) / arcR;
      shiftX =
        W < TUNE.sideShiftFrom
          ? 0
          : layout === "full"
            ? -W * TUNE.fullShift
            : Math.min(W, TUNE.column) * TUNE.sideShift;

      renderer.setSize(W, H, false);
      uniforms.uResolution.value.set(W, H);
      uniforms.uHalf.value.set(hx, hy);
      uniforms.uCorner.value = L * TUNE.corner;
      uniforms.uK.value = L * TUNE.k;
      uniforms.uArtFloor.value = L * TUNE.artFloor;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(host);

    // -- per-card smoothing state -----------------------------------------
    const state: CardState[] = Array.from({ length: count }, () => ({
      leanX: 0,
      leanY: 0,
      swell: 0,
      dim: 0,
      push: 0,
    }));
    const fan = Array.from({ length: count }, (_, i) =>
      fanOrder(loop ? wrapDelta(i, count) : i),
    );
    const maxFan = Math.max(...fan);

    atlas.first.then(() => {
      entryOpenRef.current = true;
    });

    // -- pointer ------------------------------------------------------------
    const ptr = { x: 1e5, y: 1e5, tx: 1e5, ty: 1e5, on: false };
    let dragging = false;
    let dragId = -1;
    let dragLastY = 0;
    let pressX = 0;
    let pressY = 0;
    let pressAt = 0;
    // Which card was under the finger when it went down. Resolved at press
    // time and kept: the hover the frame loop tracks is cleared the moment a
    // drag starts, so by the time the release arrives it is already -1 and
    // reading it there means no click ever lands.
    let pressed = -1;

    // The stage geometry the last frame settled on, so a press can be tested
    // against exactly what was on screen when it happened.
    const stageIdx = new Int32Array(MAX_CARDS);
    const stageRel = new Float32Array(MAX_CARDS);
    let stageN = 0;

    /** Stage slot under a point in ring space, or -1. */
    const hitAt = (x: number, y: number) => {
      for (let j = 0; j < stageN; j++) {
        const sc = rest[j * 4 + 3];
        const c = Math.cos(rest[j * 4 + 2]);
        const sn = Math.sin(rest[j * 4 + 2]);
        const vx = x - rest[j * 4];
        const vy = y - rest[j * 4 + 1];
        const qx = c * vx + sn * vy;
        const qy = -sn * vx + c * vy;
        if (Math.abs(qx) < hx * sc && Math.abs(qy) < hy * sc) return j;
      }
      return -1;
    };

    const local = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return {
        x: e.clientX - rect.left - W / 2,
        y: -(e.clientY - rect.top - H / 2),
      };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Never start a drag on a link. setPointerCapture below retargets the
      // compatibility mouse events along with the pointer ones, so `click`
      // is delivered to the host rather than to the anchor under the cursor
      // — which leaves every link in the panel inert. Let the press through
      // untouched and the browser opens it as it should.
      if ((e.target as Element | null)?.closest("a, button")) return;

      const q = local(e);
      ptr.tx = q.x;
      ptr.ty = q.y;
      ptr.on = true;
      pressed = hitAt(q.x, q.y);
      pressX = e.clientX;
      pressY = e.clientY;
      pressAt = performance.now();
      dragId = e.pointerId;
      dragLastY = e.clientY;
      targetRef.current = null;

      // Where FullPageScroll is driving us it already turns a vertical swipe
      // into a step, so taking touch drags here as well would move the ring
      // twice for one finger. The press still counts — a tap has to be able
      // to open a card on a phone.
      dragging = !(stepRef && e.pointerType === "touch");
      if (dragging) host.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const p = local(e);
      ptr.tx = p.x;
      ptr.ty = p.y;
      ptr.on = true;

      if (!dragging || e.pointerId !== dragId) return;
      const dy = e.clientY - dragLastY;
      dragLastY = e.clientY;
      // One card's worth of travel moves the ring one slot. Dragging down
      // pulls the ring down, which brings the previous project back.
      const slots = (dy * TUNE.dragSpeed) / (arcR * step);
      progressRef.current -= slots;
      velRef.current = -slots * 60;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== dragId) return;
      const wasPressed = pressed;
      dragging = false;
      dragId = -1;
      pressed = -1;
      if (host.hasPointerCapture?.(e.pointerId)) {
        host.releasePointerCapture(e.pointerId);
      }
      if (wasPressed < 0) return;

      // Straight-line travel from where the finger went down, not the sum of
      // every wobble along the way: a slow, careful press racks up plenty of
      // the latter without ever leaving the card.
      const moved = Math.hypot(e.clientX - pressX, e.clientY - pressY);
      if (moved > 10 || performance.now() - pressAt > 600) return;

      const i = stageIdx[wasPressed];
      const rel = stageRel[wasPressed];
      // The card already at the front opens; anything else comes to the
      // front first, so nothing opens from a glancing hit on a card that was
      // half off screen.
      if (Math.abs(rel) < 0.4) {
        open(i);
      } else {
        targetRef.current = Math.round(progressRef.current + rel);
        velRef.current = 0;
      }
    };

    const onLeave = () => {
      ptr.on = false;
      ptr.tx = 1e5;
      ptr.ty = 1e5;
    };

    // FullPageScroll owns the wheel wherever it hands us a `stepRef`; taking
    // it here as well would move the ring twice per tick.
    const ownWheel = !stepRef;
    let lastStepAt = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (reduced) {
        // One tick, one slot, with a cooldown — momentum is exactly the kind
        // of motion the preference is asking us not to produce.
        if (Math.abs(e.deltaY) < 6) return;
        const at = performance.now();
        if (at - lastStepAt < 300) return;
        lastStepAt = at;
        const from = Math.round(targetRef.current ?? progressRef.current);
        targetRef.current = from + Math.sign(e.deltaY);
        return;
      }
      targetRef.current = null;
      velRef.current = clamp(
        velRef.current + e.deltaY * TUNE.wheel,
        -TUNE.maxSpeed,
        TUNE.maxSpeed,
      );
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    host.addEventListener("pointerleave", onLeave);
    if (ownWheel) host.addEventListener("wheel", onWheel, { passive: false });

    // -- frame --------------------------------------------------------------
    const rest = new Float32Array(MAX_CARDS * 4); // x, y, rot, scale
    const pick = Array.from({ length: MAX_CARDS }, () => ({ i: 0, rel: 0 }));

    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(host);

    let raf = 0;
    let last = performance.now();
    let lastFront = -1;
    let lastHover = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || !activeRef.current || document.hidden) return;

      // The atlas is the gate: the ring launches on the frame the first
      // screenshot lands, so the artwork arriving and the ring moving are one
      // event rather than a hang followed by a fan.
      if (reduced) entryRef.current = 1;
      else if (entryOpenRef.current && entryRef.current < 1) {
        entryRef.current = clamp01(entryRef.current + dt / TUNE.entryTime);
      }
      const entry = entryRef.current;

      // Hovering still *reads* under reduced motion — the tag appears, a
      // click still centres — it just stops pushing the field around.
      const forces = ptr.on && !dragging && !reduced;

      // -- physics ---------------------------------------------------------
      if (!dragging) {
        if (targetRef.current !== null) {
          const t = targetRef.current;
          progressRef.current +=
            (t - progressRef.current) * chase(dt, reduced ? 0.45 : TUNE.pickRate);
          velRef.current = 0;
          if (Math.abs(t - progressRef.current) < 0.002) {
            progressRef.current = t;
            targetRef.current = null;
          }
        } else {
          if (reduced) velRef.current = 0;
          progressRef.current += velRef.current * dt;
          velRef.current *= Math.pow(TUNE.damping, dt * 60);
          // Once the flick itself is spent, settle with a card facing front.
          if (entry >= 1 && Math.abs(velRef.current) < TUNE.snapFrom) {
            const slot = Math.round(progressRef.current);
            progressRef.current +=
              (slot - progressRef.current) * chase(dt, reduced ? 0.45 : TUNE.snapRate);
            velRef.current *= 0.86;
          }
        }
      }
      if (!loop) {
        progressRef.current = clamp(progressRef.current, 0, count - 1);
      }
      const progress = progressRef.current;

      // -- cursor smoothing -------------------------------------------------
      const lag = chase(dt, 0.3);
      ptr.x += (ptr.tx - ptr.x) * lag;
      ptr.y += (ptr.ty - ptr.y) * lag;
      uniforms.uPointer.value.set(ptr.x, ptr.y);
      uniforms.uMelt.value +=
        ((forces ? L * TUNE.melt : 0) - uniforms.uMelt.value) * chase(dt, 0.12);

      // -- which cards are on stage -----------------------------------------
      let n = 0;
      for (let i = 0; i < count && n < MAX_CARDS; i++) {
        const rel = loop ? wrapDelta(i - progress, count) : i - progress;
        if (Math.abs(rel) > TUNE.window) continue;
        pick[n].i = i;
        pick[n].rel = rel;
        n++;
      }
      // Back into ring order, so the bridges below join actual neighbours
      // rather than whatever order the scan happened to find them in.
      const stage = pick.slice(0, n).sort((a, b) => a.rel - b.rel);

      // -- rest layout ------------------------------------------------------
      // Rest means "where this card would be with no cursor near it". Threads
      // are measured from here and never from the hovered positions: leaning
      // a card toward the cursor closes the gap, which fattens the thread,
      // which moves the card again. Hover changes what you see, never what
      // the goo is computed from.
      for (let j = 0; j < stage.length; j++) {
        const { i, rel } = stage[j];
        const e = fanProgress(entry, fan[i], maxFan, TUNE.stagger);
        // Centre of the wheel sits off to the left, so what you see is an
        // arc of something much bigger going past. A whole circle looks like
        // a diagram; a piece of one looks like a wheel.
        //
        // Negative theta for a positive slot puts the *next* project below
        // the front one, so advancing lifts it into place and the ring reads
        // bottom to top.
        const theta = -rel * step * e;
        const depth = smoothstep(0, TUNE.window, Math.abs(rel));
        rest[j * 4 + 0] = shiftX + arcR * (Math.cos(theta) - 1);
        rest[j * 4 + 1] = arcR * Math.sin(theta);
        // The long edge points out from the centre, so the card lies over as
        // the arc turns.
        rest[j * 4 + 2] = theta;
        rest[j * 4 + 3] = 1 - TUNE.depthScale * depth;
      }

      // -- threads ----------------------------------------------------------
      for (let j = 0; j < stage.length - 1; j++) {
        const ax = rest[j * 4];
        const ay = rest[j * 4 + 1];
        const bx = rest[(j + 1) * 4];
        const by = rest[(j + 1) * 4 + 1];
        const sa = rest[j * 4 + 3];
        const sb = rest[(j + 1) * 4 + 3];
        const dist = Math.hypot(bx - ax, by - ay);
        // Stacked, so it is the short edges that close the gap and the long
        // edges that face one another — which is what the thread comes off.
        const gapPx = dist - hy * (sa + sb);
        const v = clamp01(gapPx / (TUNE.threadReach * 2 * hy));
        const s = Math.min(sa, sb);

        // Width falls off on a curve, so it thins fast then lingers.
        let rEnd = hx * s * Math.pow(1 - v, TUNE.threadFalloff);
        // Honey strings itself between the cards you are *between*, not the
        // one you are on.
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        const dm = Math.hypot(ptr.x - mx, ptr.y - my) / (TUNE.webReach * L);
        if (forces) rEnd += hx * TUNE.web * Math.exp(-dm * dm);

        // The middle narrows faster than the ends. That is the neck.
        let rMid = rEnd * (1 - (1 - TUNE.pinch) * smoothstep(0, 1, v));
        // Drive the radius past zero near the end. Without this a thread
        // thins down to a half-covered pixel and then just stops existing,
        // which reads as a hairline flickering off. Negative carries it out
        // of antialias range so it fades from the field properly — the thread
        // does not vanish, it breaks.
        rMid -= TUNE.dissolve * hx * smoothstep(0.75, 1, v);

        uniforms.uBridge.value[j].set(
          rEnd > 0.5 ? rEnd : -1,
          rMid,
          TUNE.sag * hx * v * s,
          L * TUNE.threadK,
        );
      }

      // Publish the settled geometry so a press can be hit-tested against
      // exactly what was on screen at the moment it happened.
      stageN = stage.length;
      for (let j = 0; j < stage.length; j++) {
        stageIdx[j] = stage[j].i;
        stageRel[j] = stage[j].rel;
      }

      // -- hover, applied on top of rest ------------------------------------
      let hoverIdx = -1;
      let hoverRel = 0;
      if (ptr.on && !dragging && entry >= 1) {
        const j = hitAt(ptr.tx, ptr.ty);
        if (j >= 0) {
          hoverIdx = stage[j].i;
          hoverRel = stage[j].rel;
        }
      }
      if (hoverIdx !== lastHover) {
        lastHover = hoverIdx;
        setHovered(hoverIdx);
      }

      for (let j = 0; j < stage.length; j++) {
        const { i, rel } = stage[j];
        const st = state[i];
        const s0 = rest[j * 4 + 3];

        // Lean: a card takes up a lean quickly and lets go of it slowly.
        // Equal rates read as a mechanism following your cursor; the gap
        // between them reads as something thick being dragged through.
        let tx = 0;
        let ty = 0;
        let swell = 0;
        if (forces) {
          const vx = ptr.x - rest[j * 4];
          const vy = ptr.y - rest[j * 4 + 1];
          const dl = Math.hypot(vx, vy) / L;
          const f = Math.exp(-(dl * dl) / (TUNE.reach * TUNE.reach));
          const inv = dl > 0.0001 ? 1 / (dl * L) : 0;
          tx = vx * inv * TUNE.pull * L * f;
          ty = vy * inv * TUNE.pull * L * f;
          swell = TUNE.swell * f;
        }
        const rate = (t: number, c: number) =>
          chase(dt, Math.abs(t) > Math.abs(c) ? TUNE.grab : TUNE.release);
        st.leanX += (tx - st.leanX) * rate(tx, st.leanX);
        st.leanY += (ty - st.leanY) * rate(ty, st.leanY);
        st.swell += (swell - st.swell) * rate(swell, st.swell);

        // The cards either side of the hovered one back away and dim, which
        // is what makes the hovered card read as picked up rather than merely
        // highlighted.
        let push = 0;
        let dim = 0;
        if (forces && hoverIdx >= 0 && i !== hoverIdx) {
          const sd = Math.abs(rel - hoverRel);
          const f = 1 - smoothstep(0, TUNE.sideReach, sd);
          push = Math.sign(rel - hoverRel) * TUNE.sidePush * f;
          dim = TUNE.sideDim * f;
        }
        st.push += (push - st.push) * chase(dt, 0.14);
        st.dim += (dim - st.dim) * chase(dt, 0.14);

        const theta = rest[j * 4 + 2];
        const shove = st.push * step * arcR;
        uniforms.uCardA.value[j].set(
          rest[j * 4] + st.leanX + shove * Math.cos(theta),
          rest[j * 4 + 1] + st.leanY - shove * Math.sin(theta),
          theta,
          s0 * (1 + st.swell),
        );

        const depth = smoothstep(0, TUNE.window, Math.abs(rel));
        // Artwork is dealt by ring slot, never by fan order.
        uniforms.uCardB.value[j].set(
          i,
          (1 - TUNE.depthDim * depth) * (1 - st.dim),
          0,
          0,
        );
      }

      uniforms.uCount.value = stage.length;
      renderer.render(scene, camera);


      // -- DOM that follows the ring ----------------------------------------
      const f = ((Math.round(progress) % count) + count) % count;
      if (f !== lastFront) {
        lastFront = f;
        setFront(f);
      }
      const tag = tagRef.current;
      if (tag) {
        tag.style.transform = `translate3d(${ptr.x + W / 2}px, ${H / 2 - ptr.y}px, 0)`;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener("change", onMotionChange);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      if (ownWheel) host.removeEventListener("wheel", onWheel);
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      atlas.dispose();
      renderer.dispose();
    };
  }, [count, sources, compact, layout, loop, stepRef, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      open(front);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = Math.round(targetRef.current ?? progressRef.current) + dir;
    if (!loop && (next < 0 || next > count - 1)) return;
    targetRef.current = next;
    velRef.current = 0;
  };

  if (degraded) return <>{fallback}</>;

  const p = projects[front];
  const full = layout === "full";

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={heading || "Projects"}
      onKeyDown={onKeyDown}
      className={cn(
        "relative isolate size-full cursor-grab touch-pan-y overflow-hidden",
        "outline-none active:cursor-grabbing",
        className,
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {/* Chrome. Pointer-events off throughout, or a stray label swallows a
          drag. Two arrangements: on the homepage the ring stands in the
          right half of the site's centred column and the type takes the
          left of it, because that column is where a reader is already
          looking. On the projects page there is no column to respect, so
          the ring moves left and the whole right side becomes a panel with
          room for an actual description.

          Type scale is the site's, not this component's: section headings
          are `text-xl font-bold` the same as Skills, Work Experience and
          Recent Writing; the project name takes the display treatment a
          company name gets in work-stack.tsx, a step down because here the
          screenshot is the visual and the name is not; and the date, tags
          and links reuse that file's caption rhythm exactly. The ring is
          the only part of this that gets to be novel. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "relative h-full w-full py-5 sm:py-8",
            full ? "px-6 sm:px-10" : "mx-auto max-w-3xl px-6",
          )}
        >
          {/* Stacked, never split left-and-right: the ring spends half its
              life in one of those corners. */}
          <div className="flex flex-col gap-1">
            {heading && <h2 className="text-xl font-bold">{heading}</h2>}
            <p className="text-sm tabular-nums text-neutral-500">
              {String(front + 1).padStart(2, "0")}
              <span className="mx-1">/</span>
              {String(count).padStart(2, "0")}
            </p>
          </div>

          <div
            className={cn(
              "absolute bottom-5 flex flex-col gap-2",
              "items-center text-center md:-translate-y-1/2 md:items-start md:text-left",
              full
                ? "inset-x-6 sm:inset-x-10 md:inset-x-auto md:right-10 md:top-1/2 md:w-[36%] md:max-w-md"
                : "inset-x-6 md:inset-x-auto md:left-6 md:top-1/2 md:w-[44%]",
              "md:bottom-auto",
            )}
          >
            <Swap value={p?.title ?? ""}>
              <h3
                className={cn(
                  "font-bold tracking-tighter",
                  compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
                )}
              >
                {p?.title ?? ""}
              </h3>
            </Swap>

            {p?.dates && (
              <Swap value={p.title} delay={0.04}>
                <time className="text-sm tabular-nums text-neutral-500">
                  {p.dates}
                </time>
              </Swap>
            )}

            {full && p?.description && (
              <Swap value={p.title} delay={0.07}>
                {/* Hidden on small screens: down there the panel sits under
                    the ring with a card already crowding it. */}
                <p className="hidden text-sm leading-relaxed text-foreground/80 md:line-clamp-6 md:block">
                  {p.description}
                </p>
              </Swap>
            )}

            <Swap value={p?.title ?? ""} delay={0.1}>
              <div className="flex flex-col items-center gap-2 md:items-start">
                {p?.technologies && p.technologies.length > 0 && (
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    {p.technologies.slice(0, 4).join(" · ")}
                  </p>
                )}
                {p?.links && p.links.length > 0 && (
                  <div className="pointer-events-auto flex flex-wrap justify-center gap-4 md:justify-start">
                    {p.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-foreground sm:text-sm"
                      >
                        {l.type}
                        <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Swap>
          </div>
        </div>
      </div>

      {/* The cursor tag. `difference` rather than a colour: it inverts against
          whatever pixel it lands on, so it stays legible over a dark
          screenshot and over the page background alike. */}
      {pointerFine && (
        <div
          ref={tagRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 origin-left",
            "mix-blend-difference transition-opacity duration-200",
            hovered >= 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="-mt-3 ml-8 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium tracking-wide text-white">
            {hovered === front ? "Open" : "View"}
            <ArrowUpRight className="size-3" />
          </span>
        </div>
      )}

      {/* The ring is a picture of the list, not the list. Everything a crawler
          or a screen reader needs lives here. */}
      <ul className="sr-only">
        {projects.map((project) => (
          <li key={project.title}>
            <a href={project.href || "#"}>{project.title}</a>
            <span>{project.dates}</span>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
