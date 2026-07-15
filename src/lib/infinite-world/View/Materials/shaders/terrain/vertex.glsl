#define M_PI 3.1415926535897932384626433832795

uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;
uniform float uDayCycleProgress;
uniform float uSeed_t;
uniform float uSeed_b;
uniform vec2 uOffset;
uniform float uBorderRadius;
uniform vec3 uBorderWobble;
uniform vec3 uBorderPhases;
uniform float uBorderBand;

varying vec3 vColor;

#include ../partials/inverseLerp.glsl
#include ../partials/remap.glsl
#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;
#include ../partials/getSunReflection.glsl;
#include ../partials/getSunReflectionColor.glsl;
#include ../partials/getFogColor.glsl;
#include ../partials/getGrassAttenuation.glsl;
#include ../partials/getBorderBarren.glsl;
#include ../partials/simplex.glsl

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    float depth = - viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;

    // Terrain data
    vec4 terrainData = texture2D(uTexture, uv);
    vec3 normal = terrainData.rgb;

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // Color
    vec3 uGrassDefaultColor = vec3(0.52, 0.65, 0.26);
    vec3 uGrassShadedColor = vec3(0.52 / 1.3, 0.65 / 1.3, 0.26 / 1.3);
    
    // Grass distance attenuation
    // Terrain must match the bottom of the grass which is darker
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;
    vec3 grassColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - grassAttenuation);

    vec3 color = grassColor;

    // --- Tier 1 Forest Tint ---
    float upward = max(0.0, normal.y);
    float slopeMask = smoothstep(0.9, 0.95, upward);
    
    float biomeNoise = snoise(vec3(modelPosition.x * 0.01 + uOffset.x, modelPosition.z * 0.01 + uOffset.y, uSeed_b));
    
    float threshold = 0.95;
    if (biomeNoise > 0.2) threshold = 0.6;
    else if (biomeNoise > -0.2) threshold = 0.85;

    float treeNoise = snoise(vec3(modelPosition.x * 0.5 + uOffset.x, modelPosition.z * 0.5 + uOffset.y, uSeed_t));
    treeNoise = (treeNoise + 1.0) * 0.5;

    float treeDensity = smoothstep(threshold, threshold + 0.2, treeNoise);
    
    vec3 forestColor = vec3(0.176, 0.290, 0.117); // Green (#2d4a1e)
    if (biomeNoise > 0.8) {
        forestColor = vec3(0.290, 0.227, 0.117); // Orange (#4a3a1e)
    } else if (biomeNoise < -0.8) {
        forestColor = vec3(0.117, 0.227, 0.227); // Blue (#1e3a3a)
    }

    float tier1Fade = smoothstep(600.0, 1500.0, depth);
    vec3 forestTint = mix(color, forestColor, treeDensity * tier1Fade * slopeMask * 0.75);
    color = forestTint;

    // Barren band along the border wall — the wall lets nothing grow near it
    float borderBarren = getBorderBarren(modelPosition.xz);
    vec3 barrenColor = vec3(0.34, 0.26, 0.14); // dead dirt
    color = mix(color, barrenColor, borderBarren * 0.9);

    // Sun shade
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    // Sun reflection
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    color = getSunReflectionColor(color, sunReflection);

    // Fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // vec3 dirtColor = vec3(0.3, 0.2, 0.1);
    // vec3 color = mix(dirtColor, grassColor, terrainData.g);

    // Varyings
    vColor = color;
}