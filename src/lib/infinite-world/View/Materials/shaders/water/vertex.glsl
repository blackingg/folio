#define M_PI 3.1415926535897932384626433832795

uniform vec3 uSunPosition;
uniform vec3 uMoonPosition;
uniform float uDayCycleProgress;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uBaseColor;

varying vec2 vUv;
varying vec3 vColor;
varying float vFresnel;

#include ../partials/getDawnCycleIntensity.glsl;
#include ../partials/getSunMoonReflection.glsl;
#include ../partials/getSunReflectionColor.glsl;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // Base reflection — day/night-aware sun-or-moon glint. Water has never
    // had any reflective shading before this; see getSunMoonReflection.glsl.
    float reflection = getSunMoonReflection(viewDirection, worldNormal, viewNormal);
    vColor = getSunReflectionColor(uBaseColor, reflection);

    // Plain grazing-angle term (no sun/moon dot) — this is what lets the
    // reflection anomaly fade in at grazing angles and vanish when looking
    // straight down at the water, independent of where the sun/moon sits.
    float fresnel = uFresnelOffset + uFresnelScale * (1.0 + dot(viewDirection, worldNormal));
    vFresnel = clamp(fresnel, 0.0, 1.0);

    vUv = uv;
}
