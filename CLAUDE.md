# CLAUDE.md

Project context for any agent working in this repo.

## Stack

Next.js 14 (App Router) portfolio site, TypeScript, Tailwind. Blog posts are
MDX (site is canonical; Medium is a backfill target — see
`scripts/backfill-medium.mjs`). Key areas under `src/app/`: `blog`, `work`,
`projects`, and `3d` (the Project TRUMAN 3D world, see below).

## Project TRUMAN (3D world)

A custom procedural-terrain 3D world reachable from the portfolio, branded
"Project TRUMAN" (Truman-Show themed). Not a generic three.js scene — it's a
hand-built engine under `src/lib/infinite-world/`, bridged into React via
`src/components/3d/InfiniteWorld.tsx` and mounted from `src/app/3d/layout.tsx`
/ `src/components/3d/WorldLoader.tsx`.

### Architecture

State/View split, singleton-style modules (`getInstance()`):

- **State** (`src/lib/infinite-world/State/`) — simulation: `Player.js`
  (movement + border collision), `Chunk.js`/`Chunks.js` (terrain streaming),
  camera variants (`Camera.js`, `CameraThirdPerson.js`, `CameraFly.js`),
  `Controls.js` (keyboard — movement + `Space` only, no generic "interact"
  key exists), `GamepadControls.js`, `XRControls.js` (VR), day/night
  (`DayCycle.js`, `Sun.js`, `Moon.js`, `Time.js`), `ExperienceManager.js`
  (zone registry driver), `Viewport.js`.
- **View** (`src/lib/infinite-world/View/`) — rendering: `Renderer.js`,
  terrain (`Terrain.js`/`Terrains.js`/`TerrainGradient.js`), `Grass.js`,
  trees (`Trees.js`/`TreeBillboards.js`), water (`Water.js`/`Underwater.js`),
  `Sky.js`, plus `Materials/` — hand-written GLSL for everything. **The scene
  has no standard three.js lights**; all shading is custom sun-position math
  (`getSunShade.glsl`, `getSunReflection.glsl`, etc.). A standard lit
  material renders black here — new visuals must reuse an existing shader
  material or be unlit (`MeshBasicMaterial`).
- **Workers** (`Workers/Terrain.js`, `SimplexNoise.js`) — heightmap computed
  off main thread.
- **`worldGen.js`** — single source of truth, deliberately framework-free
  (no three.js/DOM) so the terrain worker, engine, and HUD map all derive
  from the same data:
  - `TERRAIN` — noise params (octaves, lacunarity, persistence, amplitude).
  - `BORDER` — the coastline wall: radius 500, wobbled by three sine terms
    (`wobble: [60, 35, 18]`), single gate due north (`gateAngle: -Math.PI/2`).
    `wallCollisionHalfWidth()` derives the collision band width. Seeded with
    `TERRAIN_SEED` (`WORLD_SEED + 'b'` = `'pb'`) via `createBorder(seed)` —
    every real call site (`Player.js`, `Terrains.js`, `Grass.js`,
    `Workers/Terrain.js`) uses `TERRAIN_SEED`, not `WORLD_SEED` alone.
  - `EXPERIENCES` — the zone registry:
    `{ id, x, z, triggerRadius, preloadRadius, flattenRadius, targetHeight, gltfPaths }`.
    Terrain auto-flattens toward `targetHeight` near each zone
    (`getElevation()`); the HUD map and `ExperienceManager` both read this
    same array.
  - Angle convention everywhere: `theta = atan2(z, x)`, i.e.
    `x = r·cos(theta)`, `z = r·sin(theta)`. Confirmed in `Player.js`,
    `Workers/Terrain.js`, `WorldMap.tsx` — don't flip this.

### Experience system

`src/lib/infinite-world/experiences/` + `ExperienceManager.js`:

- Base class `Experience.js`: `load/onEnter/update/passiveUpdate/onExit/dispose`.
- `ExperienceManager` drives every registered experience off `EXPERIENCES`,
  handling preload/trigger/dispose radius crossings. Unless a zone opts out
  with `loadingOrb: false`, it also renders a pale mist-dome marker that
  fades as the player approaches (`checkZones()`).
- `Basketball.js` and `Village.js` are currently empty stubs (lifecycle
  methods just call `super`) — trigger radii and `.glb` paths are wired, but
  no actual content yet.
- `GodsPalm.js` is the one fully-built example: a custom additive-blended
  shader-cylinder light beam + a "stand in the circle, get lifted" mechanic
  with frame-rate-independent easing. No GLTF required — good reference for
  lightweight, landmark-only zones.

### Quality / perf

`quality.js`: tiers `low/medium/high` gate grass density, billboard density,
chunk depth, pixel ratio cap, camera far plane, max-instances-per-tree, and
terrain `subdivisions`/`maxIterations` (the per-chunk vertex grid resolution
and noise-octave count — the terrain worker's two heaviest knobs;
`chunkMaxDepth` alone only trims the outer LOD rings, so the closest chunk
used to cost the same regardless of tier until these were added).
`detectTier()` special-cases Quest browser → `medium`. `VR_OVERLAY` applies
extra reductions during an active XR session.

### HUD

`src/components/3d/hud/`: `WorldMenu.tsx`, `HudCluster.tsx`/`HudButton.tsx`,
`TouchControls.tsx`, `VrButton.tsx`, and a `map/` subfolder (`WorldMap.tsx` +
`terrainMap.worker.ts`) that mirrors `worldGen.js`'s border math for the
topographic HUD map.

### Assets

`public/models/` has `lowpoly_tree_game_asset.glb` + a `trees/` folder only —
no court/village/shipwreck models exist yet despite being referenced. Audio
assets are not yet populated beyond two music tracks in `public/audio/`.

### Local-only docs (bootstrap per machine)

`docs/project-truman/` is gitignored on purpose — ideas/brainstorm content
for this feature should stay private, unlike the architecture facts above
which are safe to be public. Because it's gitignored, **it will not exist on
a fresh clone or a new machine** — git never brings it along.

If you're asked to research, brainstorm, or plan anything for Project TRUMAN
and this folder doesn't exist yet, create it yourself before doing anything
else — don't wait to be asked, and don't ask the user for the missing
folder:

1. `docs/project-truman/PROJECT_TRUMAN.md` — start it from the architecture
   section above (copy/adapt, it's already accurate), then add an "Ideas
   backlog" section that grows as you and the user brainstorm. This is the
   living doc any agent on this machine should read first and keep current.
2. When an idea moves from "brainstorm" to "being built," give it its own
   file in the same folder (e.g. `CAMERA_EASTER_EGG_PLAN.md`) and link it
   from `PROJECT_TRUMAN.md`'s "Linked sub-plans" section rather than
   duplicating detail across files.
