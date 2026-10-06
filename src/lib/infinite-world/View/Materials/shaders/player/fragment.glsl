#define M_PI 3.1415926535897932384626433832795

uniform vec3 uSunPosition;
uniform vec3 uColor;
uniform float uDayCycleProgress;

varying vec3 vGameNormal;

#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;

void main()
{
    vec3 color = uColor;

    float sunShade = getSunShade(vGameNormal);
    color = getSunShadeColor(color, sunShade);
    
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vColor, 1.0);
}