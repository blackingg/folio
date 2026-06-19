import { ShaderMaterial } from 'three';

import vertexShader from './shaders/player/vertex.glsl'
import fragmentShader from './shaders/player/fragment.glsl'

export default function PlayerMaterial()
{
    const material = new ShaderMaterial({
        uniforms:
        {
            uColor: { value: null },
            uLightnessSmoothness: { value: null },
            uSunPosition: { value: null },
            uDayCycleProgress: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}
