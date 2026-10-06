import { ShaderMaterial, DoubleSide } from 'three';

import vertexShader from './shaders/water/vertex.glsl'
import fragmentShader from './shaders/water/fragment.glsl'

export default function WaterMaterial()
{
    const material = new ShaderMaterial({
        transparent: true,
        side: DoubleSide,
        uniforms:
        {
            uSunPosition: { value: null },
            uMoonPosition: { value: null },
            uDayCycleProgress: { value: 0 },
            uFresnelOffset: { value: null },
            uFresnelScale: { value: null },
            uFresnelPower: { value: null },
            uBaseColor: { value: null },
            uOpacity: { value: 0.7 },
            uGlitchStrength: { value: 0 },
            uGlitchUv: { value: null },
            uGlitchScale: { value: 0.025 },
            uGlitchTexture: { value: null }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}
