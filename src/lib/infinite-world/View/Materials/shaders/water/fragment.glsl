uniform float uOpacity;
uniform float uGlitchStrength;
uniform vec2 uGlitchUv;
uniform float uGlitchScale;
uniform sampler2D uGlitchTexture;

varying vec2 vUv;
varying vec3 vColor;
varying float vFresnel;

void main()
{
    vec3 color = vColor;

    // Sample the glitch silhouette from a small patch of the water plane
    // centred on uGlitchUv — outside that patch it contributes nothing.
    vec2 glitchLocalUv = (vUv - uGlitchUv) / uGlitchScale + 0.5;
    float inPatch = step(0.0, glitchLocalUv.x) * step(glitchLocalUv.x, 1.0)
        * step(0.0, glitchLocalUv.y) * step(glitchLocalUv.y, 1.0);
    float silhouette = texture2D(uGlitchTexture, glitchLocalUv).a * inPatch;

    // Visible only while a pulse is active, and only at grazing view angles —
    // this is what makes it disappear if the camera looks straight at it.
    float glitchVisibility = uGlitchStrength * vFresnel;
    color = mix(color, vec3(0.05, 0.06, 0.08), silhouette * glitchVisibility);

    gl_FragColor = vec4(color, uOpacity);
}
