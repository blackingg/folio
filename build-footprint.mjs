// Offline codegen for the shipwreck's collision data — NOT run automatically
// as part of any build step (prebuild, CI, etc.). Run it by hand, only when
// public/models/restored-minecraft-shipwreck/source/Ship.glb itself changes:
//
//   node build-footprint.mjs
//
// It parses the raw binary GLTF directly (fs/Buffer, no bundler), voxelizes
// the real hull geometry into a sparse 1-unit occupancy grid, and overwrites
// src/lib/infinite-world/experiences/shipwreckCollisionCells.js with the
// result. That output file is committed and consumed at runtime by
// Shipwreck.js#collide() — this script is a generator, not a dependency.
import fs from 'node:fs'

const buf = fs.readFileSync('public/models/restored-minecraft-shipwreck/source/Ship.glb')
const totalLength = buf.readUInt32LE(8)

let offset = 12
let json = null
let bin = null
while (offset < totalLength) {
    const chunkLength = buf.readUInt32LE(offset)
    const chunkType = buf.readUInt32LE(offset + 4)
    const chunkData = buf.subarray(offset + 8, offset + 8 + chunkLength)
    if (chunkType === 0x4e4f534a) json = JSON.parse(chunkData.toString('utf8'))
    else if (chunkType === 0x004e4942) bin = chunkData
    offset += 8 + chunkLength
}

function readAccessor(idx) {
    const acc = json.accessors[idx]
    const bv = json.bufferViews[acc.bufferView]
    const compSize = { 5126: 4, 5123: 2, 5125: 4 }[acc.componentType]
    const numComponents = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[acc.type]
    const start = (bv.byteOffset || 0) + (acc.byteOffset || 0)
    const out = []
    for (let i = 0; i < acc.count; i++) {
        const itemStart = start + i * (bv.byteStride || compSize * numComponents)
        const item = []
        for (let c = 0; c < numComponents; c++) {
            const o = itemStart + c * compSize
            if (acc.componentType === 5126) item.push(bin.readFloatLE(o))
            else if (acc.componentType === 5123) item.push(bin.readUInt16LE(o))
            else if (acc.componentType === 5125) item.push(bin.readUInt32LE(o))
        }
        out.push(item)
    }
    return out
}

function nodeMatrix(node) {
    if (node.matrix) return node.matrix
    const t = node.translation || [0, 0, 0]
    const r = node.rotation || [0, 0, 0, 1]
    const s = node.scale || [1, 1, 1]
    const [x, y, z, w] = r
    const x2 = x+x, y2 = y+y, z2 = z+z
    const xx = x*x2, xy = x*y2, xz = x*z2
    const yy = y*y2, yz = y*z2, zz = z*z2
    const wx = w*x2, wy = w*y2, wz = w*z2
    return [
        (1-(yy+zz))*s[0], (xy+wz)*s[0], (xz-wy)*s[0], 0,
        (xy-wz)*s[1], (1-(xx+zz))*s[1], (yz+wx)*s[1], 0,
        (xz+wy)*s[2], (yz-wx)*s[2], (1-(xx+yy))*s[2], 0,
        t[0], t[1], t[2], 1,
    ]
}
function applyMatrix(m, v) {
    const [x, y, z] = v
    return [
        m[0]*x + m[4]*y + m[8]*z + m[12],
        m[1]*x + m[5]*y + m[9]*z + m[13],
        m[2]*x + m[6]*y + m[10]*z + m[14],
    ]
}

const allTris = []
for (const node of json.nodes) {
    if (node.mesh === undefined) continue
    const mesh = json.meshes[node.mesh]
    const m = nodeMatrix(node)
    for (const prim of mesh.primitives) {
        const positions = readAccessor(prim.attributes.POSITION).map(p => applyMatrix(m, p))
        const indices = prim.indices !== undefined ? readAccessor(prim.indices).map(i => i[0]) : positions.map((_, i) => i)
        for (let i = 0; i < indices.length; i += 3) {
            allTris.push([positions[indices[i]], positions[indices[i+1]], positions[indices[i+2]]])
        }
    }
}

let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity
for (const tri of allTris) for (const [x,y,z] of tri) {
    minX=Math.min(minX,x); maxX=Math.max(maxX,x)
    minY=Math.min(minY,y); maxY=Math.max(maxY,y)
    minZ=Math.min(minZ,z); maxZ=Math.max(maxZ,z)
}
const centerX = (minX+maxX)/2, centerZ = (minZ+maxZ)/2
console.log('world bbox:', { minX, maxX, minY, maxY, minZ, maxZ })

// Full-hull voxelization (every layer, not just ground) — swimming means the
// player can reach any height within the wreck, so collision needs to cover
// the whole structure, not just where it meets the seafloor.
const CELL = 1

const occupied = new Set()
for (const tri of allTris) {
    const xs = tri.map(v => v[0] - centerX)
    const ys = tri.map(v => v[1] - minY)
    const zs = tri.map(v => v[2] - centerZ)
    const x0 = Math.floor(Math.min(...xs) / CELL), x1 = Math.ceil(Math.max(...xs) / CELL)
    const y0 = Math.floor(Math.min(...ys) / CELL), y1 = Math.ceil(Math.max(...ys) / CELL)
    const z0 = Math.floor(Math.min(...zs) / CELL), z1 = Math.ceil(Math.max(...zs) / CELL)

    // A triangle flat on any one axis (near-universal here — this is a
    // low-poly Minecraft export, so faces sit exactly on integer grid
    // boundaries) gives ceil(max) === floor(min) on that axis, collapsing
    // the loop below to zero iterations and silently dropping the whole
    // triangle from the grid. Measured on the real asset: 52.8% of all
    // triangles (5612/10628) were lost this way, hollowing out huge
    // swaths of the hull — most dramatically the entire flat keel/bottom,
    // which sits right on y=0 after recentreOnFloor. Every triangle must
    // claim at least its own 1x1x1 cell.
    const x1c = Math.max(x1, x0 + 1)
    const y1c = Math.max(y1, y0 + 1)
    const z1c = Math.max(z1, z0 + 1)

    for (let cx = x0; cx < x1c; cx++)
        for (let cy = y0; cy < y1c; cy++)
            for (let cz = z0; cz < z1c; cz++)
                occupied.add(`${cx},${cy},${cz}`)
}

console.log('\ntotal occupied cells (full hull):', occupied.size)
const cells = [...occupied].map(k => k.split(',').map(Number))

fs.writeFileSync(
    'src/lib/infinite-world/experiences/shipwreckCollisionCells.js',
    '// Auto-generated by build-footprint.mjs from Ship.glb — a sparse voxel\n' +
    '// occupancy grid (1-unit cells) of the hull, in the model\'s recentred\n' +
    '// local space (same frame AssetManager.loadUnlitModel()\'s recenterOnFloor\n' +
    '// leaves it in: horizontally centred, lowest point at local y=0).\n' +
    '//\n' +
    '// NOT regenerated automatically by any build step — run manually\n' +
    '// (`node build-footprint.mjs`) only if Ship.glb itself changes.\n' +
    'export default ' + JSON.stringify(cells) + '\n'
)
console.log('written src/lib/infinite-world/experiences/shipwreckCollisionCells.js —', cells.length, 'cells')
