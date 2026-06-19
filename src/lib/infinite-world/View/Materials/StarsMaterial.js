import { ShaderMaterial, Vector3 } from 'three';

import vertexShader from './shaders/stars/vertex.glsl'
import fragmentShader from './shaders/stars/fragment.glsl'

export default function StarsMaterial()
{
    const material = new ShaderMaterial({
        uniforms:
        {
            uSunPosition: { value: new Vector3() },
            uSize: { value: 0.01 },
            uBrightness: { value: 0.5 },
            uHeightFragments: { value: null }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}
