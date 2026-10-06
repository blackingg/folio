import * as THREE from 'three';

/**
 * This engine's scene has no standard three.js lights — everything is
 * shaded by custom sun-position materials (see worldGen.js and
 * docs/project-truman/PROJECT_TRUMAN.md). A GLTF loaded through GLTFLoader
 * arrives with lit MeshStandardMaterial and renders solid black untouched.
 * This is the shared fix: swap onto MeshBasicMaterial, keeping color and
 * texture, so any authored asset is visible without a bespoke shader.
 */
export function toUnlitMaterial(source) {
    const material = new THREE.MeshBasicMaterial();
    if (source.color) material.color.copy(source.color);
    if (source.map) material.map = source.map;
    return material;
}

/** Converts every mesh material under root onto toUnlitMaterial, in place. */
export function convertSceneToUnlit(root) {
    root.traverse((child) => {
        if (!child.isMesh) return;
        child.material = Array.isArray(child.material)
            ? child.material.map(toUnlitMaterial)
            : toUnlitMaterial(child.material);
    });
    return root;
}

/**
 * Recentres an object horizontally on its own bounding box and drops its
 * base to local y=0. Authored/exported assets aren't guaranteed to be
 * centred on their own pivot (e.g. a raw Minecraft structure export sits
 * at local x/z 0..N, not -N/2..N/2) — this lets callers do
 * model.position.set(x, groundY, z) and have it actually land correctly,
 * instead of offset beside or floating above the point they meant to place
 * it at.
 */
export function recenterOnFloor(root) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());

    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= box.min.y;

    return root;
}
