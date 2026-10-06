// How "barren" the ground is around the border wall — 1.0 on the wall line,
// fading to 0.0 at uBorderBand world units on either side. The wall lets
// nothing grow near it. Mirrors createBorder() in worldGen.js (same wobble
// frequencies 3/5/9; radius, amplitudes and phases come in as uniforms).
float getBorderBarren(vec2 position)
{
    float theta = atan(position.y, position.x);
    float wallRadius = uBorderRadius
        + uBorderWobble.x * sin(theta * 3.0 + uBorderPhases.x)
        + uBorderWobble.y * sin(theta * 5.0 + uBorderPhases.y)
        + uBorderWobble.z * sin(theta * 9.0 + uBorderPhases.z);
    float wallOffset = abs(length(position) - wallRadius);

    return 1.0 - smoothstep(uBorderBand * 0.6, uBorderBand, wallOffset);
}
