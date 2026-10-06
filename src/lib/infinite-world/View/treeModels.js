/**
 * Tree model manifest.
 *
 * Each entry represents one logical tree type and lists the individual GLB
 * files that make up its parts (foliage mesh first, trunk/wood mesh second).
 *
 * This mirrors the INGREDIENTS / BASE_URL pattern — adding or removing a tree
 * type is a single-line change here; Trees.js never needs to change.
 *
 * Files live in public/models/trees/ and are served at /models/trees/ at runtime.
 */

const BASE_URL = '/models/trees/';
const MODELS_URL = '/models/';

// Player capsule is ~1.8 units tall; distant billboards target 4–7 units.
// GLB trees are ~9 units at scale 1, so this brings them in line with the character.
export const TREE_SCALE = 0.45;

export const TREE_MODELS = [
    // ── Green Trees ────────────────────────────────────────────────────────
    {
        id: 'Blockytree_01_green',
        meshes: [
            BASE_URL + 'Blockytree_01_green.glb',
        ],
    },
    {
        id: 'Blockytree_02_green',
        meshes: [
            BASE_URL + 'Blockytree_02_green.glb',
        ],
    },
    {
        id: 'Blockytree_03_green',
        meshes: [
            BASE_URL + 'Blockytree_03_green.glb',
        ],
    },
    {
        id: 'Blockytree_04_green',
        meshes: [
            BASE_URL + 'Blockytree_04_green.glb',
        ],
    },
    {
        id: 'Voxeltree_01_green',
        meshes: [
            BASE_URL + 'Voxeltree_01_green.glb',
        ],
    },
    {
        id: 'Voxeltree_02_green',
        meshes: [
            BASE_URL + 'Voxeltree_02_green.glb',
        ],
    },
    {
        id: 'Voxeltree_03_green',
        meshes: [
            BASE_URL + 'Voxeltree_03_green.glb',
        ],
    },
    {
        id: 'Voxeltree_04_green',
        meshes: [
            BASE_URL + 'Voxeltree_04_green.glb',
        ],
    },

    // ── Blue Trees ─────────────────────────────────────────────────────────
    {
        id: 'Blockytree_01_blue',
        meshes: [
            BASE_URL + 'Blockytree_01_blue.glb',
        ],
    },
    {
        id: 'Blockytree_02_blue',
        meshes: [
            BASE_URL + 'Blockytree_02_blue.glb',
        ],
    },
    {
        id: 'Blockytree_03_blue',
        meshes: [
            BASE_URL + 'Blockytree_03_blue.glb',
        ],
    },
    {
        id: 'Blockytree_04_blue',
        meshes: [
            BASE_URL + 'Blockytree_04_blue.glb',
        ],
    },
    {
        id: 'Voxeltree_01_blue',
        meshes: [
            BASE_URL + 'Voxeltree_01_blue.glb',
        ],
    },
    {
        id: 'Voxeltree_02_blue',
        meshes: [
            BASE_URL + 'Voxeltree_02_blue.glb',
        ],
    },
    {
        id: 'Voxeltree_03_blue',
        meshes: [
            BASE_URL + 'Voxeltree_03_blue.glb',
        ],
    },
    {
        id: 'Voxeltree_04_blue',
        meshes: [
            BASE_URL + 'Voxeltree_04_blue.glb',
        ],
    },

    // ── Orange Trees ───────────────────────────────────────────────────────
    {
        id: 'Blockytree_01_orange',
        meshes: [
            BASE_URL + 'Blockytree_01_orange.glb',
        ],
    },
    {
        id: 'Blockytree_02_orange',
        meshes: [
            BASE_URL + 'Blockytree_02_orange.glb',
        ],
    },
    {
        id: 'Blockytree_03_orange',
        meshes: [
            BASE_URL + 'Blockytree_03_orange.glb',
        ],
    },
    {
        id: 'Blockytree_04_orange',
        meshes: [
            BASE_URL + 'Blockytree_04_orange.glb',
        ],
    },
    {
        id: 'Voxeltree_01_orange',
        meshes: [
            BASE_URL + 'Voxeltree_01_orange.glb',
        ],
    },
    {
        id: 'Voxeltree_02_orange',
        meshes: [
            BASE_URL + 'Voxeltree_02_orange.glb',
        ],
    },
    {
        id: 'Voxeltree_03_orange',
        meshes: [
            BASE_URL + 'Voxeltree_03_orange.glb',
        ],
    },
    {
        id: 'Voxeltree_04_orange',
        meshes: [
            BASE_URL + 'Voxeltree_04_orange.glb',
        ],
    },
];
