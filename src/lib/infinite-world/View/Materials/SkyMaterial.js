import { Color, Matrix4, ShaderMaterial, Vector3 } from 'three';

import vertexShader from "./shaders/sky/vertex.glsl";
import fragmentShader from "./shaders/sky/fragment.glsl";

export default function SkyMaterial() {
    const material = new ShaderMaterial({
        uniforms: {
            uNoise3D: { value: null },
            uTime: { value: 0 },
            uCameraPosition: { value: new Vector3() },
            uInverseProjectionMatrix: { value: new Matrix4() },
            uCameraWorldMatrix: { value: new Matrix4() },
            uSunPosition: { value: new Vector3() },
            uMoonPosition: { value: new Vector3() },
            uAtmosphereElevation: { value: 0.5 },
            uAtmospherePower: { value: 6 },
            uColorDayCycleLow: { value: new Color() },
            uColorDayCycleHigh: { value: new Color() },
            uColorNightLow: { value: new Color() },
            uColorNightHigh: { value: new Color() },
            uDawnAngleAmplitude: { value: 1 },
            uDawnElevationAmplitude: { value: 0.2 },
            uColorDawn: { value: new Color() },
            uSunAmplitude: { value: 0.75 },
            uSunMultiplier: { value: 1 },
            uColorSun: { value: new Color() },
            uDayCycleProgress: { value: 0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    return material;
}
