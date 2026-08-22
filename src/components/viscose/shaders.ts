// The whole carousel is one rectangle running one fragment shader. Every card
// is a rounded-box distance function on an arc, combined with a *smooth*
// minimum so neighbours fuse into one surface instead of overlapping. Two
// `<img>` tags will never merge; once every shape is a distance rather than an
// object, merging is arithmetic.

/**
 * How many cards the shader is compiled to consider. The frame loop uploads
 * only the nearest few, so adding projects costs zero shader work.
 */
export const MAX_CARDS = 9;

export const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const FRAGMENT = /* glsl */ `
  precision highp float;

  #define MAX_CARDS ${MAX_CARDS}

  varying vec2 vUv;

  uniform vec2      uResolution;   // CSS px
  uniform sampler2D uAtlas;
  uniform vec2      uGrid;         // atlas cols, rows
  uniform vec2      uHalf;         // card half size in px, at scale 1
  uniform float     uCorner;       // corner radius, px
  uniform float     uK;            // base smin strength, px — the viscosity
  uniform float     uArtFloor;     // px, softening floor on the art weights
  uniform float     uAA;           // antialias width, CSS px per device px
  uniform int       uCount;

  // xy = centre in px, z = rotation, w = scale
  uniform vec4 uCardA[MAX_CARDS];
  // x = atlas cell, y = brightness, zw = spare
  uniform vec4 uCardB[MAX_CARDS];
  // between card i and i+1 — x = end radius, y = mid radius, z = sag, w = smin k
  uniform vec4 uBridge[MAX_CARDS];

  uniform vec2  uPointer;
  uniform float uMelt;             // px of extra viscosity at the cursor
  uniform float uMeltReach;        // px that softening carries
  uniform vec3  uBg;
  uniform vec3  uInk;              // silhouette tint where no art has landed

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // The honey between two cards: a slab swept centre to centre, pinched in the
  // middle and drooping under its own weight.
  //
  // Not a capsule: a round cross-section bulges past the flat sides of the
  // cards at full merge. Swept as a box it stays inside them.
  float sdBridge(vec2 p, vec2 a, vec2 b, float rEnd, float rMid, float sag) {
    vec2 ba = b - a;
    float len = length(ba);
    if (len < 0.001) return 1e6;

    vec2 dir = ba / len;
    vec2 nrm = vec2(-dir.y, dir.x);

    vec2 q = p - (a + b) * 0.5;
    float along = dot(q, dir);
    float across = dot(q, nrm);

    float h = clamp(along / len + 0.5, 0.0, 1.0);
    float bell = sin(3.14159265 * h);          // 0 at the ends, 1 in the middle

    across += sag * bell * nrm.y;              // droop, resolved onto the normal

    float taper = pow(1.0 - bell, 1.7);        // 1 at the ends, 0 in the middle
    float r = mix(rMid, rEnd, taper);

    // Ends are square and buried inside the cards, so they never show.
    return max(abs(along) - len * 0.5, abs(across) - r);
  }

  // Smooth minimum — why the shapes read as liquid: plain min() unions with a
  // crease, this swells the join into a fillet. Degrades to min() at the 1e6
  // sentinel, so seeding the accumulator needs no special case.
  float smin(float a, float b, float k) {
    if (k <= 0.0001) return min(a, b);
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  void main() {
    vec2 p = (vUv - 0.5) * uResolution;

    // Nothing is drawn at the cursor; it raises k locally, so the surface goes
    // soft under it and stays stiff further out.
    vec2 toPointer = p - uPointer;
    float melt = uMelt * exp(-dot(toPointer, toPointer) / (uMeltReach * uMeltReach));
    float k = uK + melt;

    float d = 1e6;
    vec3 art = vec3(0.0);
    float wsum = 0.0;

    for (int i = 0; i < MAX_CARDS; i++) {
      if (i >= uCount) break;

      vec4 A = uCardA[i];
      vec4 B = uCardB[i];
      float s = A.w;
      vec2 hb = uHalf * s;

      // Into card space: rotate by -A.z about the card's centre.
      float c = cos(A.z);
      float sn = sin(A.z);
      vec2 v = p - A.xy;
      vec2 q = vec2(c * v.x + sn * v.y, -sn * v.x + c * v.y);

      float di = sdRoundBox(q, hb, min(uCorner * s, min(hb.x, hb.y)));
      d = smin(d, di, k);

      // Art is dealt by weight, not by nearest card: inside the fillet where
      // two have fused there is no nearest one, and picking a winner puts a
      // seam down the join.
      //
      // Weighted by the *ratio* of distances, not exp(-d/px). A falloff in
      // pixels has to serve gaps that constantly change size and fails at both
      // ends — banding across a wide gap, mush across a narrow one. Inverse
      // distance is scale-free, so the crossfade always occupies exactly the
      // gap it is crossing. uArtFloor keeps the divide finite and sets how
      // hard pixels at a card face lock to that card's own artwork.
      float dw = max(di, 0.0) + uArtFloor;
      float w = 1.0 / (dw * dw);

      vec2 t = clamp(
        vec2(0.5 + q.x / (2.0 * hb.x), 0.5 - q.y / (2.0 * hb.y)),
        0.002, 0.998
      );
      float cell = B.x;
      vec2 slot = vec2(mod(cell, uGrid.x), floor(cell / uGrid.x));
      art += texture2D(uAtlas, (slot + t) / uGrid).rgb * B.y * w;
      wsum += w;
    }

    for (int i = 0; i < MAX_CARDS - 1; i++) {
      if (i >= uCount - 1) break;
      vec4 T = uBridge[i];
      if (T.x <= 0.0) continue;     // no thread left between this pair
      d = smin(d, sdBridge(p, uCardA[i].xy, uCardA[i + 1].xy, T.x, T.y, T.z), T.w);
    }

    vec3 col = wsum > 0.0 ? art / wsum : uInk;
    float a = smoothstep(uAA, -uAA, d);

    gl_FragColor = vec4(mix(uBg, col, a), 1.0);
  }
`;
