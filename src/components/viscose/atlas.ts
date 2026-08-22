import * as THREE from "three";

// Cell aspect matches the card's, so nothing is squashed on the way in.
const CELL_W = 512;

/** Draws a cell itself instead of loading one. The rect handed over is
 *  already clipped, so a painter can be careless about its bounds. */
export type CellPainter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) => void;

export type Atlas = {
  texture: THREE.CanvasTexture;
  grid: [number, number];
  /** Settles once cell 0 is on the sheet — the entry waits on this. */
  first: Promise<void>;
  /** Settles once every cell has been tried. Never rejects. */
  ready: Promise<void>;
  dispose: () => void;
};

const load = (src: string, priority: "high" | "low") =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // Must be set before src, or the request is already away.
    (img as unknown as { fetchPriority: string }).fetchPriority = priority;
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`atlas: failed to load ${src}`));
    img.src = src;
  });

/**
 * Packs every screenshot into one texture.
 *
 * One sheet rather than one texture per card, because GLSL ES 1.00 cannot
 * index an array of samplers with a non-constant index.
 *
 * Returns synchronously with the sheet pre-filled: the renderer needs
 * something to bind on frame one.
 */
export function buildAtlas(
  sources: readonly (string | CellPainter)[],
  fill: string,
  aspect = 1.5,
): Atlas {
  const cellH = Math.round(CELL_W / aspect);
  const cols = Math.ceil(Math.sqrt(sources.length));
  const rows = Math.ceil(sources.length / cols);

  const canvas = document.createElement("canvas");
  canvas.width = cols * CELL_W;
  canvas.height = rows * cellH;
  const ctx = canvas.getContext("2d")!;
  // Unloaded cells read as a muted placeholder rather than a black hole.
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  // The shader flips each cell itself, so leave the sheet as drawn.
  texture.flipY = false;
  // NoColorSpace deliberately: the shader writes straight to the framebuffer
  // with no encoding step, and decoding on read without encoding on write is
  // what washes screenshots out.
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const paint = (img: HTMLImageElement, i: number) => {
    const x = (i % cols) * CELL_W;
    const y = Math.floor(i / cols) * cellH;

    // Cover fit, anchored to the top: these are screenshots, and the header is
    // the subject.
    const scale = Math.max(CELL_W / img.width, cellH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, CELL_W, cellH); // clip, or an oversized shot bleeds
    ctx.clip();
    ctx.drawImage(img, x + (CELL_W - dw) / 2, y, dw, dh);
    ctx.restore();
  };

  // Cells that draw themselves, painted up front so frame one has them.
  const paintCell = (i: number) => {
    const src = sources[i];
    if (typeof src !== "function") return false;
    const x = (i % cols) * CELL_W;
    const y = Math.floor(i / cols) * cellH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, CELL_W, cellH);
    ctx.clip();
    src(ctx, x, y, CELL_W, cellH);
    ctx.restore();
    return true;
  };
  const painted = sources.map((_, i) => paintCell(i)).some(Boolean);
  if (painted) texture.needsUpdate = true;

  // Canvas text is baked when drawn, so a painter that runs before the page's
  // typeface arrives is stuck with the fallback. Draw again once it lands.
  if (painted && typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      sources.forEach((_, i) => paintCell(i));
      texture.needsUpdate = true;
    });
  }

  const remote = sources
    .map((src, i) => (typeof src === "string" ? i : -1))
    .filter((i) => i >= 0);

  const fetchInto = (i: number, priority: "high" | "low") =>
    load(sources[i] as string, priority)
      .then((img) => paint(img, i))
      .catch(() => {
        /* a missing file leaves its cell on the placeholder and still counts
           as settled, so one bad path cannot strand the entry */
      });

  // Cell 0 is whatever the ring opens on, so it is asked for first.
  const first =
    typeof sources[0] === "function"
      ? Promise.resolve()
      : fetchInto(0, "high").then(() => {
          texture.needsUpdate = true;
        });

  // One upload at the end: marking the texture dirty per image re-sends the
  // whole sheet once per screenshot.
  const ready = Promise.all([
    first,
    ...remote.filter((i) => i !== 0).map((i) => fetchInto(i, "low")),
  ]).then(() => {
    texture.needsUpdate = true;
  });

  return {
    texture,
    grid: [cols, rows],
    first,
    ready,
    dispose: () => {
      texture.dispose();
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
