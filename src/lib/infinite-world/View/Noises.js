import { Data3DTexture, LinearFilter, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, RGBAFormat, RepeatWrapping, Scene, UnsignedByteType, WebGLRenderTarget } from 'three';

import View from './View.js';
import NoisesMaterial from "./Materials/NoisesMaterial.js";
import Noises3DMaterial from "./Materials/Noises3DMaterial.js";

export default class Noises {
    constructor() {
        this.view = View.getInstance();
        this.renderer = this.view.renderer;
        this.scene = this.view.scene;

        this.setCustomRender();
        this.setMaterial();
        this.setPlane();
        // this.setHelper()

        // const texture = this.createNoise(128, 128)
    }

    setCustomRender() {
        this.customRender = {};
        this.customRender.scene = new Scene();
        this.customRender.camera = new OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0.1,
            10,
        );
    }

    setMaterial() {
        this.material = new NoisesMaterial();
    }

    setPlane() {
        this.plane = new Mesh(
            new PlaneGeometry(2, 2),
            this.material,
        );
        this.plane.frustumCulled = false;
        this.customRender.scene.add(this.plane);
    }

    setHelper() {
        this.helper = {};
        this.helper.geometry = new PlaneGeometry(1, 1);
        this.helper.material = new MeshBasicMaterial();

        const meshA = new Mesh(
            this.helper.geometry,
            this.helper.material,
        );
        meshA.position.y = 5 + 1;
        meshA.position.x = -1;
        meshA.scale.set(2, 2, 2);

        const meshB = new Mesh(
            this.helper.geometry,
            this.helper.material,
        );
        meshB.position.y = 5 + 1;
        meshB.position.x = 1;
        meshB.scale.set(2, 2, 2);

        const meshC = new Mesh(
            this.helper.geometry,
            this.helper.material,
        );
        meshC.position.y = 5 - 1;
        meshC.position.x = -1;
        meshC.scale.set(2, 2, 2);

        const meshD = new Mesh(
            this.helper.geometry,
            this.helper.material,
        );
        meshD.position.y = 5 - 1;
        meshD.position.x = 1;
        meshD.scale.set(2, 2, 2);

        window.requestAnimationFrame(() => {
            this.scene.add(meshA);
            // this.scene.add(meshB)
            // this.scene.add(meshC)
            // this.scene.add(meshD)
        });
    }

    create(width, height) {
        const renderTarget = new WebGLRenderTarget(width, height, {
            generateMipmaps: false,
            wrapS: RepeatWrapping,
            wrapT: RepeatWrapping,
        });

        this.renderer.instance.setRenderTarget(renderTarget);
        this.renderer.instance.render(
            this.customRender.scene,
            this.customRender.camera,
        );
        this.renderer.instance.setRenderTarget(null);

        const texture = renderTarget.texture;
        // texture.wrapS = RepeatWrapping
        // texture.wrapT = RepeatWrapping

        if (this.helper) this.helper.material.map = texture;

        return texture;
    }

    /**
     * Bake a 128 Ã— 128 Ã— 128 Data3DTexture using 3-D periodic Perlin noise.
     *
     * The volume is built by rendering one XZ slice per Y level (128 passes).
     * Each 128Ã—128 render is read back to the CPU and packed into the final
     * Uint8Array before being uploaded as a single Data3DTexture.
     *
     * GLSL sampling convention (sampler3D):
     *   texture(uNoise3D, vec3(worldX / period, worldZ / period, worldY / yRange))
     *   â†’ s (width=xSize)  â†’ world X
     *   â†’ t (height=zSize) â†’ world Z
     *   â†’ r (depth=yLevels)â†’ world Y
     *
     * @param {number} xSize   - Texel count along world X (default 128)
     * @param {number} zSize   - Texel count along world Z (default 128)
     * @param {number} yLevels - Number of Y slices / depth layers (default 128)
     * @returns {Data3DTexture}
     */
    create3D(xSize = 128, zSize = 128, yLevels = 128) {
        // --- temporary scene: fullscreen quad + new material per call ---
        const scene = new Scene();
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        const material = new Noises3DMaterial();
        const plane = new Mesh(new PlaneGeometry(2, 2), material);
        plane.frustumCulled = false;
        scene.add(plane);

        // Single render target reused for every slice
        const rt = new WebGLRenderTarget(xSize, zSize, {
            generateMipmaps: false,
        });

        const totalData = new Uint8Array(xSize * zSize * yLevels * 4);
        const sliceBuffer = new Uint8Array(xSize * zSize * 4);

        for (let layer = 0; layer < yLevels; layer++) {
            // uLayer: 0.0 (bottom Y level) â†’ 1.0 (top Y level)
            material.uniforms.uLayer.value =
                yLevels > 1 ? layer / (yLevels - 1) : 0.0;

            this.renderer.instance.setRenderTarget(rt);
            this.renderer.instance.render(scene, camera);
            this.renderer.instance.setRenderTarget(null);

            // Readback: pixels are packed bottom-row-first, matching Data3DTexture layout
            this.renderer.instance.readRenderTargetPixels(
                rt,
                0,
                0,
                xSize,
                zSize,
                sliceBuffer,
            );

            // Each layer occupies xSize * zSize * 4 bytes starting at layer's offset
            totalData.set(sliceBuffer, layer * xSize * zSize * 4);
        }

        // Release temporary GPU resources
        rt.dispose();
        plane.geometry.dispose();
        material.dispose();

        // Assemble Data3DTexture â€” dimensions must match the data layout above:
        //   new Data3DTexture(data, width, height, depth)
        //   width=xSize, height=zSize, depth=yLevels
        const texture3D = new Data3DTexture(
            totalData,
            xSize,
            zSize,
            yLevels,
        );
        texture3D.format = RGBAFormat;
        texture3D.type = UnsignedByteType;
        texture3D.minFilter = LinearFilter;
        texture3D.magFilter = LinearFilter;
        texture3D.wrapS = RepeatWrapping;
        texture3D.wrapT = RepeatWrapping;
        texture3D.wrapR = RepeatWrapping; // corresponds to W(depth) in UVW mapping
        texture3D.needsUpdate = true;

        return texture3D;
    }
}
