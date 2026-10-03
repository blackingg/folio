import { ShaderMaterial } from 'three';

import vertexShader from './shaders/noises/vertex.glsl'
import fragmentShader from './shaders/noises/fragment.glsl'

export default function NoisesMaterial()
{
    const material = new ShaderMaterial({
        uniforms:
        {
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}