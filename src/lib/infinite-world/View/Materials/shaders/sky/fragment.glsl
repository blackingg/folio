uniform sampler3D uNoise3D;
uniform float uTime;
uniform vec3 uCameraPosition;
uniform vec3 uSunPosition;
uniform vec3 uMoonPosition;

varying vec3 vWorldPosition;
varying vec3 vColor;
varying vec3 vCloudBody;
varying vec3 vCloudShadow;
varying vec3 vSunColor;

// Flat "painted" backdrop clouds — one plane, one noise fetch per pixel.
// (The previous volumetric raymarcher cost up to ~170 fetches per pixel;
// the sky is a backdrop, not a hero.)
#define CLOUD_HEIGHT    150.0  // plane the clouds are painted on
#define CLOUD_SCALE     900.0  // world-units per noise tile
#define CLOUD_SPEED     15.0   // world-units per millisecond scrolled in x
#define CLOUD_COVERAGE  0.2    // noise threshold — raise for fewer clouds
#define CLOUD_SOFTNESS  0.25   // edge feather above the threshold
#define M_THRES         0.01   // ray y-threshold: below this is pure sky
#define THRES_OFFSET    0.12   // range over which clouds fade near horizon

void main()
{
    vec3 rayDir = normalize(vWorldPosition);

    // Sun glow spot
    float distanceToSun = distance(rayDir, uSunPosition);
    float sunIntensity = smoothstep(0.012, 0.01, distanceToSun);
    float horizonFactor = smoothstep(M_THRES, M_THRES + THRES_OFFSET, rayDir.y);
    float sunHorizonFactor = smoothstep(0.0, 0.02, rayDir.y);
    vec3 skyColor = mix(vColor, vSunColor, sunIntensity * sunHorizonFactor);

    // Moon glow spot
    float distanceToMoon = distance(rayDir, uMoonPosition);
    float moonIntensity = smoothstep(0.012, 0.01, distanceToMoon);
    skyColor = mix(skyColor, vec3(1.0), moonIntensity * horizonFactor);

    // Below the horizon there are no clouds to paint
    if (rayDir.y < M_THRES) {
        gl_FragColor = vec4(skyColor, 1.0);
        return;
    }

    // Project the view ray onto the cloud plane
    float t = (CLOUD_HEIGHT - uCameraPosition.y) / rayDir.y;
    if (t <= 0.0) {
        gl_FragColor = vec4(skyColor, 1.0);
        return;
    }

    vec3 samplePos = uCameraPosition + t * rayDir;
    float scroll = uTime * CLOUD_SPEED;
    vec3 uvw = vec3(
        (samplePos.x + scroll) / CLOUD_SCALE,
        (samplePos.z + scroll * 0.3) / CLOUD_SCALE,
        0.5
    );
    float density = texture(uNoise3D, uvw).r;

    // Soft-edged cloud mask, fading into the sky near the horizon
    float cloudAlpha = smoothstep(CLOUD_COVERAGE, CLOUD_COVERAGE + CLOUD_SOFTNESS, density) * horizonFactor;

    // Dense cores read as shaded undersides; colors come from the vertex
    // shader so dawn/day/night tinting keeps working unchanged
    float core = smoothstep(CLOUD_COVERAGE + CLOUD_SOFTNESS, CLOUD_COVERAGE + CLOUD_SOFTNESS * 3.0, density);
    vec3 cloudColor = mix(vCloudBody, vCloudShadow, core);
    cloudColor = mix(skyColor, cloudColor, horizonFactor);

    gl_FragColor = vec4(mix(skyColor, cloudColor, cloudAlpha), 1.0);
}
