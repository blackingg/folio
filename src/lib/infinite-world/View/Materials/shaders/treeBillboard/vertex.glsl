#define M_PI 3.1415926535897932384626433832795

uniform vec3 uPlayerPosition;
uniform float uGridSize;
uniform float uSeed_t;
uniform float uSeed_b;
uniform vec2 uOffset;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform vec3 uSunPosition;
uniform float uDayCycleProgress;
uniform sampler2D uFogTexture;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainATexture;
uniform vec2 uTerrainAOffset;
uniform sampler2D uTerrainBTexture;
uniform vec2 uTerrainBOffset;
uniform sampler2D uTerrainCTexture;
uniform vec2 uTerrainCOffset;
uniform sampler2D uTerrainDTexture;
uniform vec2 uTerrainDOffset;

attribute vec2 instanceCenter;
attribute float aType;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;
varying float vIsShadow;

#include ../partials/simplex.glsl
#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;

void main()
{
    // --- Wrap instance center around the player (toroidal grid) ---
    vec2 newCenter = instanceCenter - uPlayerPosition.xz;
    float halfSize = uGridSize * 0.5;
    newCenter.x = mod(newCenter.x + halfSize, uGridSize) - halfSize;
    newCenter.y = mod(newCenter.y + halfSize, uGridSize) - halfSize;
    
    vec2 worldCenter = newCenter + uPlayerPosition.xz;

    // --- Evaluate tree noise at this world position ---
    float biomeNoise = snoise(vec3(worldCenter.x * 0.01 + uOffset.x, worldCenter.y * 0.01 + uOffset.y, uSeed_b));
    
    float threshold = 0.95;
    if (biomeNoise > 0.2) threshold = 0.6;
    else if (biomeNoise > -0.2) threshold = 0.85;

    float treeNoise = snoise(vec3(worldCenter.x * 0.5 + uOffset.x, worldCenter.y * 0.5 + uOffset.y, uSeed_t));
    treeNoise = (treeNoise + 1.0) * 0.5;

    // --- Get terrain elevation from textures ---
    vec2 terrainAUv = (worldCenter - uTerrainAOffset.xy) / uTerrainSize;
    vec2 terrainBUv = (worldCenter - uTerrainBOffset.xy) / uTerrainSize;
    vec2 terrainCUv = (worldCenter - uTerrainCOffset.xy) / uTerrainSize;
    vec2 terrainDUv = (worldCenter - uTerrainDOffset.xy) / uTerrainSize;
    
    float fragmentSize = 1.0 / uTerrainTextureSize;
    vec4 terrainAColor = texture2D(uTerrainATexture, terrainAUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainBColor = texture2D(uTerrainBTexture, terrainBUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainCColor = texture2D(uTerrainCTexture, terrainCUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainDColor = texture2D(uTerrainDTexture, terrainDUv * (1.0 - fragmentSize) + fragmentSize * 0.5);

    vec4 terrainData = vec4(0);
    terrainData += step(0.0, terrainAUv.x) * step(terrainAUv.x, 1.0) * step(0.0, terrainAUv.y) * step(terrainAUv.y, 1.0) * terrainAColor;
    terrainData += step(0.0, terrainBUv.x) * step(terrainBUv.x, 1.0) * step(0.0, terrainBUv.y) * step(terrainBUv.y, 1.0) * terrainBColor;
    terrainData += step(0.0, terrainCUv.x) * step(terrainCUv.x, 1.0) * step(0.0, terrainCUv.y) * step(terrainCUv.y, 1.0) * terrainCColor;
    terrainData += step(0.0, terrainDUv.x) * step(terrainDUv.x, 1.0) * step(0.0, terrainDUv.y) * step(terrainDUv.y, 1.0) * terrainDColor;

    float elevation = terrainData.a;
    vec3 terrainNormal = terrainData.rgb;
    float upward = max(0.0, terrainNormal.y);

    // --- Determine if this instance is a tree ---
    // Collapse to zero scale if: no tree, underwater, or on a steep slope
    float isTree = step(threshold, treeNoise);
    float aboveWater = step(0.1, elevation);
    float isFlat = step(0.95, upward);
    float scale = isTree * aboveWater * isFlat;

    // --- Pseudo-random scale variation per tree ---
    float r = fract(sin(worldCenter.x * 12.9898 + worldCenter.y * 78.233) * 43758.5453);
    float treeHeight = (4.0 + r * 3.0) * scale; // 4-7 units tall
    float treeWidth = treeHeight * 0.5;

    vUv = uv;
    vIsShadow = 1.0 - aType;
    float isShadow = vIsShadow;
    float isBillboard = 1.0 - isShadow;

    // --- Build model position ---
    vec4 modelPosition = vec4(position, 1.0);
    
    // Scale the quad
    modelPosition.x *= treeWidth;
    modelPosition.y *= treeHeight * isBillboard; // shadow has no height, it's flat on XZ
    modelPosition.z *= treeWidth * 1.5 * isShadow;     // billboard has no depth, shadow has depth

    // Add a tiny bit of height to the shadow so it doesn't z-fight with terrain
    modelPosition.y += 0.2 * isShadow;
    
    // Cylindrical billboarding: rotate around Y to face camera
    vec3 worldCenterPos = vec3(worldCenter.x, elevation, worldCenter.y);
    float angleToCamera = atan(worldCenterPos.x - cameraPosition.x, worldCenterPos.z - cameraPosition.z);
    
    // Billboard rotates to face camera. Shadow can just rotate too, it's an ellipse anyway.
    float cosA = cos(angleToCamera * isBillboard);
    float sinA = sin(angleToCamera * isBillboard);
    
    vec3 rotatedPos = vec3(
        modelPosition.x * cosA - modelPosition.z * sinA,
        modelPosition.y,
        modelPosition.x * sinA + modelPosition.z * cosA
    );

    vec4 worldPosition = vec4(worldCenterPos + rotatedPos, 1.0);
    
    vec4 viewPosition = viewMatrix * worldPosition;
    float depth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;

    // --- Distance-based alpha dithering ---
    float dist = length(newCenter);
    float innerFade = smoothstep(uInnerRadius - 200.0, uInnerRadius, dist);
    float outerFade = 1.0 - smoothstep(uOuterRadius - 500.0, uOuterRadius, dist);
    vAlpha = innerFade * outerFade * scale;

    // --- Color based on biome ---
    vec3 treeColor;
    if (biomeNoise > 0.8) {
        // Orange grove
        treeColor = vec3(0.65, 0.45, 0.15);
    } else if (biomeNoise < -0.8) {
        // Blue grove
        treeColor = vec3(0.15, 0.40, 0.50);
    } else {
        // Green (default)
        treeColor = vec3(0.25, 0.50, 0.18);
    }
    
    // Darken the bottom half of the billboard
    float heightGradient = position.y; // 0 at base, 1 at top
    treeColor = mix(treeColor * 0.5, treeColor, smoothstep(0.0, 0.6, heightGradient));
    
    // Sun shade
    vec3 billboardNormal = vec3(0.0, 1.0, 0.0);
    float sunShade = getSunShade(billboardNormal);
    treeColor = getSunShadeColor(treeColor, sunShade);

    // Fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    vec4 fogData = texture2D(uFogTexture, screenUv);
    float uFogIntensity = 0.0025;
    float fogIntensity = 1.0 - exp(- uFogIntensity * uFogIntensity * depth * depth);
    treeColor = mix(treeColor, fogData.rgb, fogIntensity);

    vColor = treeColor;
}
