import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




import View from './View.js';

import State from '../State/State.js';

import Game from '../Game.js';

import { TREE_MODELS, TREE_SCALE } from './treeModels.js';


        // (index 0 = foliage, index 1 = trunk — mirrors TREE_MODELS[i].meshes order)

export default class Trees {

    constructor() {

        this.game = Game.getInstance();

        this.view = View.getInstance();

        this.state = State.getInstance();
        // Terrain data arrives asynchronously from the worker — listen for 'ready'
        // so trees are placed once the elevation + trees array is actually populated.

        this.scene = this.view.scene;



        // treesMeshes[i] = array of InstancedMesh for each part of tree type i

        this.maxInstancesPerTree = this.game.quality?.maxInstancesPerTree ?? 20000;
        this.treesMeshes = [];

        // Chunk churn fires bursts of create/destroy/ready events — queue a
        // single rebuild and flush it once per frame in update() instead of
        // rebuilding every instance matrix per event.
        this._rebuildQueued = false;



        this.state.chunks.events.on('create', (chunk) => this.onChunkCreate(chunk));


        this.state.chunks.events.on('destroy', (chunk) => this.onChunkDestroy(chunk));

        // Build a Promise for each tree type — each resolves when all its part
        // GLBs have loaded. Parts load in parallel; types also load in parallel.


        this.state.terrains.events.on('create', (terrain) => {

            terrain.events.on('ready', () => {

                if (this.loaded) this._rebuildQueued = true;

            });

        });

        this.loadModels();

    }

            // results[i] = array of GLTF objects for TREE_MODELS[i]'s parts


    createMaterial(baseMaterial) {
        const material = new THREE.MeshBasicMaterial();
        if (baseMaterial.color) material.color.copy(baseMaterial.color);
        if (baseMaterial.map) material.map = baseMaterial.map;

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uSunPosition     = { value: new THREE.Vector3() };
            shader.uniforms.uDayCycleProgress = { value: 0 };
            shader.uniforms.uFogTexture      = { value: this.view.terrains.material.uniforms.uFogTexture.value };
            shader.uniforms.uResolution      = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>\n                varying vec3 vViewPos;`
            );
            shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>',
                `#include <project_vertex>\n                vViewPos = mvPosition.xyz;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>\n                uniform vec3  uSunPosition;\n                uniform float uDayCycleProgress;\n                uniform sampler2D uFogTexture;\n                uniform vec2  uResolution;\n                varying vec3  vViewPos;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                vec2  screenUv  = gl_FragCoord.xy / uResolution;
                float depth     = -vViewPos.z;
                float fadeAlpha = smoothstep(500.0, 400.0, depth);

                float bayerMatrix[16];
                bayerMatrix[0]  = 0.0/16.0; bayerMatrix[1]  = 8.0/16.0; bayerMatrix[2]  = 2.0/16.0; bayerMatrix[3]  = 10.0/16.0;
                bayerMatrix[4]  = 12.0/16.0; bayerMatrix[5]  = 4.0/16.0; bayerMatrix[6]  = 14.0/16.0; bayerMatrix[7]  = 6.0/16.0;
                bayerMatrix[8]  = 3.0/16.0; bayerMatrix[9]  = 11.0/16.0; bayerMatrix[10] = 1.0/16.0; bayerMatrix[11] = 9.0/16.0;
                bayerMatrix[12] = 15.0/16.0; bayerMatrix[13] = 7.0/16.0; bayerMatrix[14] = 13.0/16.0; bayerMatrix[15] = 5.0/16.0;
            
                ivec2 bayerCoord = ivec2(mod(gl_FragCoord.xy, 4.0));
                int bayerIndex = bayerCoord.x + bayerCoord.y * 4;
                float bayerThreshold = bayerMatrix[bayerIndex];
                
                if (fadeAlpha < bayerThreshold) discard;
                if (fadeAlpha < 0.01) discard;

                vec4  fogData   = texture2D(uFogTexture, screenUv);
                float fogFactor = smoothstep(600.0, 1500.0, depth);
                gl_FragColor.rgb = mix(gl_FragColor.rgb, fogData.rgb, fogFactor * fogData.a);`
            );

            material.userData.shader = shader;
        };

        return material;
    }



    loadModels() {

        const loader = new GLTFLoader();



        const typePromises = TREE_MODELS.map((treeType) =>

            Promise.all(

                treeType.meshes.map(

                    (src) => new Promise((resolve, reject) =>

                        loader.load(src, resolve, undefined, (err) => {

                            console.error(`[Trees] Failed to load ${src}:`, err);

                            reject(err);

                        })

                    )

                )

            )

        );



        Promise.all(typePromises).then((results) => {

            for (let i = 0; i < results.length; i++) {

                const gltfs = results[i];

                const treeType = TREE_MODELS[i];

                const groupMeshes = [];



                const parts = [];

                for (let p = 0; p < gltfs.length; p++) {

                    const gltf = gltfs[p];

                    gltf.scene.updateMatrixWorld(true);



                    let foundMesh = false;
        // mainChunks are split parent chunks — terrain data lives on final leaf chunks.
        // Iterate allChunks and only process leaves (chunk.final === true).

                    gltf.scene.traverse((child) => {

                        if (!child.isMesh) return;

                        foundMesh = true;



                        const geometry = child.geometry.clone();

                        geometry.applyMatrix4(child.matrixWorld);

                        parts.push({ geometry, material: child.material });
                    // Apply the same matrix to all sub-meshes (foliage + trunk)

                    });



                    if (!foundMesh) {

                        console.warn(`[Trees] No mesh found in ${treeType.meshes[p]} — skipping part`);

                    }

                }



                if (parts.length === 0) continue;



                const bounds = new THREE.Box3();

                for (const part of parts) {


                    part.geometry.computeBoundingBox();

                    bounds.union(part.geometry.boundingBox);

                }

                const center = bounds.getCenter(new THREE.Vector3());
                const offset = new THREE.Vector3(-center.x, -bounds.min.y, -center.z);

                for (const part of parts) {

                    part.geometry.translate(offset.x, offset.y, offset.z);
                    let materials;
                    if (Array.isArray(part.material)) {
                        materials = part.material.map(m => this.createMaterial(m));
                    } else {
                        materials = this.createMaterial(part.material);
                    }



                    const instancedMesh = new THREE.InstancedMesh(

                        part.geometry,

                        materials,

                        this.maxInstancesPerTree

                    );



                    instancedMesh.count = 0;

                    instancedMesh.castShadow = false;

                    instancedMesh.receiveShadow = false;

                    // Instances span the whole world while the bounding sphere only
                    // covers the base geometry at the origin — never frustum cull,
                    // matching Grass and TreeBillboards.
                    instancedMesh.frustumCulled = false;



                    this.scene.add(instancedMesh);

                    groupMeshes.push(instancedMesh);

                }



                this.treesMeshes.push(groupMeshes);

            }



            console.log(`[Trees] Loaded ${this.treesMeshes.length} tree type(s) from ${TREE_MODELS.length} manifest entries`);

            this.loaded = true;

            this.updateAllChunks();

        }).catch((err) => {

            console.error('[Trees] One or more GLBs failed to load — trees will not render:', err);

        });

    }



    onChunkCreate(chunk) {

        if (!this.loaded) return;

        this._rebuildQueued = true;

    }



    onChunkDestroy(chunk) {

        if (!this.loaded) return;

        this._rebuildQueued = true;

    }



    updateAllChunks() {

        if (!this.loaded) return;



        const counts = new Array(this.treesMeshes.length).fill(0);

        const dummy = new THREE.Object3D();



        for (const [id, chunk] of this.state.chunks.allChunks) {

            if (chunk.final && chunk.terrain && chunk.terrain.trees) {

                for (const tree of chunk.terrain.trees) {

                    const type = tree.type % this.treesMeshes.length;



                    if (counts[type] >= this.maxInstancesPerTree) continue;



                    dummy.position.set(tree.position[0], tree.position[1], tree.position[2]);

                    const scale = tree.scale * TREE_SCALE;

                    dummy.scale.set(scale, scale, scale);



                    dummy.rotation.y = tree.rotation;

                    dummy.updateMatrix();



                    for (const instancedMesh of this.treesMeshes[type]) {

                        instancedMesh.setMatrixAt(counts[type], dummy.matrix);

                    }



                    counts[type]++;

                }

            }

        }



        for (let i = 0; i < this.treesMeshes.length; i++) {

            for (const instancedMesh of this.treesMeshes[i]) {

                instancedMesh.count = counts[i];

                instancedMesh.instanceMatrix.needsUpdate = true;

            }

        }



        const total = counts.reduce((a, b) => a + b, 0);

        if (total > 0 && !this._loggedTreeCount) {

            this._loggedTreeCount = true;

            console.log(`[Trees] Placed ${total} tree instance(s) across ${this.treesMeshes.length} type(s)`);

        } else if (total === 0 && this.loaded) {

            console.warn('[Trees] updateAllChunks ran but placed 0 trees — check terrain data or chunk state');

        }

    }



    update() {

        if (!this.loaded) return;

        if (this._rebuildQueued) {
            this._rebuildQueued = false;
            this.updateAllChunks();
        }

        const sunState = this.state.sun;

        const dayState = this.state.day;

        const fogTexture = this.view.terrains.material.uniforms.uFogTexture.value;



        for (const groupMeshes of this.treesMeshes) {

            for (const mesh of groupMeshes) {

                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

                for (const mat of materials) {

                    if (mat.userData.shader) {
                        mat.userData.shader.uniforms.uSunPosition.value.set(
                            sunState.position.x,
                            sunState.position.y,
                            sunState.position.z
                        );
                        mat.userData.shader.uniforms.uDayCycleProgress.value = dayState.progress;
                        if (fogTexture) {
                            mat.userData.shader.uniforms.uFogTexture.value = fogTexture;
                        }
                    }

                }

            }

        }

    }

}


