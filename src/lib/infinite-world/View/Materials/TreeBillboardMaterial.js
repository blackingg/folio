import { ShaderMaterial } from "three";

import vertexShader from "./shaders/treeBillboard/vertex.glsl";
import fragmentShader from "./shaders/treeBillboard/fragment.glsl";

export default function TreeBillboardMaterial() {
  const material = new ShaderMaterial({
    uniforms: {
      uPlayerPosition: { value: null },
      uGridSize: { value: null },
      uSeed_t: { value: 0 },
      uSeed_b: { value: 0 },
      uOffset: { value: null },
      uInnerRadius: { value: 400.0 },
      uOuterRadius: { value: 2500.0 },
      uSunPosition: { value: null },
      uDayCycleProgress: { value: 0 },
      uFogTexture: { value: null },
      uTerrainSize: { value: null },
      uTerrainTextureSize: { value: null },
      uTerrainATexture: { value: null },
      uTerrainAOffset: { value: null },
      uTerrainBTexture: { value: null },
      uTerrainBOffset: { value: null },
      uTerrainCTexture: { value: null },
      uTerrainCOffset: { value: null },
      uTerrainDTexture: { value: null },
      uTerrainDOffset: { value: null },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: 2, // DoubleSide
    depthWrite: true,
    transparent: false,
  });

  return material;
}
