varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;
varying float vIsShadow;

void main()
{
    float alpha = vAlpha;
    vec3 color = vColor;

    if (vIsShadow > 0.5) {
        // Shadow: soft ellipse
        float dist = length(vUv - vec2(0.5));
        if (dist > 0.5) discard;
        alpha *= smoothstep(0.5, 0.1, dist) * 0.7; // soft edge
        color = color * 0.2; // darken shadow
    } else {
        // Billboard: simple cone shape (placeholder for sprite atlas)
        float widthAtY = 1.0 - vUv.y;
        float distFromCenter = abs(vUv.x - 0.5) * 2.0;
        
        // Add a trunk
        float isTrunk = step(distFromCenter, 0.15) * step(vUv.y, 0.3);
        float isLeaves = step(distFromCenter, widthAtY);
        
        if (isTrunk < 0.5 && isLeaves < 0.5) discard;
        
        if (isTrunk > 0.5 && isLeaves < 0.5) {
            color *= 0.3; // dark brown trunk
        }
    }

    // Alpha dither (Bayer 4x4 pattern for screen-space dithering)
    float bayerMatrix[16];
    bayerMatrix[0]  = 0.0  / 16.0; bayerMatrix[1]  = 8.0  / 16.0;
    bayerMatrix[2]  = 2.0  / 16.0; bayerMatrix[3]  = 10.0 / 16.0;
    bayerMatrix[4]  = 12.0 / 16.0; bayerMatrix[5]  = 4.0  / 16.0;
    bayerMatrix[6]  = 14.0 / 16.0; bayerMatrix[7]  = 6.0  / 16.0;
    bayerMatrix[8]  = 3.0  / 16.0; bayerMatrix[9]  = 11.0 / 16.0;
    bayerMatrix[10] = 1.0  / 16.0; bayerMatrix[11] = 9.0  / 16.0;
    bayerMatrix[12] = 15.0 / 16.0; bayerMatrix[13] = 7.0  / 16.0;
    bayerMatrix[14] = 13.0 / 16.0; bayerMatrix[15] = 5.0  / 16.0;

    ivec2 fragCoord = ivec2(mod(gl_FragCoord.xy, 4.0));
    int index = fragCoord.x + fragCoord.y * 4;
    float bayerThreshold = bayerMatrix[index];
    
    if (alpha < bayerThreshold) discard;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, 1.0);
}
