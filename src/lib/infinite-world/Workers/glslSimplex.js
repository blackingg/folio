// Port of Ashima 3D Simplex Noise to match GLSL snoise exactly.
export function mod289(x) { return x - Math.floor(x * (1.0 / 289.0)) * 289.0; }

export function permute(x) { return mod289(((x * 34.0) + 10.0) * x); }

export function taylorInvSqrt(r) { return 1.79284291400159 - 0.85373472095314 * r; }

export function snoise3D(x, y, z) {
    const C_x = 1.0 / 6.0;
    const C_y = 1.0 / 3.0;
    const D_y = 0.5;
    const D_z = 1.0;
    const D_w = 2.0;

    // First corner
    const dot_v_Cyyy = (x + y + z) * C_y;
    let i_x = Math.floor(x + dot_v_Cyyy);
    let i_y = Math.floor(y + dot_v_Cyyy);
    let i_z = Math.floor(z + dot_v_Cyyy);

    const dot_i_Cxxx = (i_x + i_y + i_z) * C_x;
    const x0_x = x - i_x + dot_i_Cxxx;
    const x0_y = y - i_y + dot_i_Cxxx;
    const x0_z = z - i_z + dot_i_Cxxx;

    // Other corners
    const g_x = x0_y >= x0_x ? 1.0 : 0.0;
    const g_y = x0_z >= x0_y ? 1.0 : 0.0;
    const g_z = x0_x >= x0_z ? 1.0 : 0.0;

    const l_x = 1.0 - g_x;
    const l_y = 1.0 - g_y;
    const l_z = 1.0 - g_z;

    const i1_x = Math.min(g_x, l_z);
    const i1_y = Math.min(g_y, l_x);
    const i1_z = Math.min(g_z, l_y);

    const i2_x = Math.max(g_x, l_z);
    const i2_y = Math.max(g_y, l_x);
    const i2_z = Math.max(g_z, l_y);

    const x1_x = x0_x - i1_x + C_x;
    const x1_y = x0_y - i1_y + C_x;
    const x1_z = x0_z - i1_z + C_x;

    const x2_x = x0_x - i2_x + C_y;
    const x2_y = x0_y - i2_y + C_y;
    const x2_z = x0_z - i2_z + C_y;

    const x3_x = x0_x - D_y;
    const x3_y = x0_y - D_y;
    const x3_z = x0_z - D_y;

    // Permutations
    i_x = mod289(i_x);
    i_y = mod289(i_y);
    i_z = mod289(i_z);

    const p_x = permute(permute(permute(i_z + 0.0) + i_y + 0.0) + i_x + 0.0);
    const p_y = permute(permute(permute(i_z + i1_z) + i_y + i1_y) + i_x + i1_x);
    const p_z = permute(permute(permute(i_z + i2_z) + i_y + i2_y) + i_x + i2_x);
    const p_w = permute(permute(permute(i_z + 1.0) + i_y + 1.0) + i_x + 1.0);

    // Gradients
    const ns_x = (1.0 / 7.0) * D_w - 0.0;
    const ns_y = (1.0 / 7.0) * D_y - 1.0;
    const ns_z = (1.0 / 7.0) * D_z - 0.0;
    const ns_w = (1.0 / 7.0) * D_y - 1.0;

    const j_x = p_x - 49.0 * Math.floor(p_x * ns_z * ns_z);
    const j_y = p_y - 49.0 * Math.floor(p_y * ns_z * ns_z);
    const j_z = p_z - 49.0 * Math.floor(p_z * ns_z * ns_z);
    const j_w = p_w - 49.0 * Math.floor(p_w * ns_z * ns_z);

    const x__x = Math.floor(j_x * ns_z);
    const x__y = Math.floor(j_y * ns_z);
    const x__z = Math.floor(j_z * ns_z);
    const x__w = Math.floor(j_w * ns_z);

    const y__x = Math.floor(j_x - 7.0 * x__x);
    const y__y = Math.floor(j_y - 7.0 * x__y);
    const y__z = Math.floor(j_z - 7.0 * x__z);
    const y__w = Math.floor(j_w - 7.0 * x__w);

    const xx_x = x__x * ns_x + ns_y;
    const xx_y = x__y * ns_x + ns_y;
    const xx_z = x__z * ns_x + ns_y;
    const xx_w = x__w * ns_x + ns_y;

    const yy_x = y__x * ns_x + ns_y;
    const yy_y = y__y * ns_x + ns_y;
    const yy_z = y__z * ns_x + ns_y;
    const yy_w = y__w * ns_x + ns_y;

    const h_x = 1.0 - Math.abs(xx_x) - Math.abs(yy_x);
    const h_y = 1.0 - Math.abs(xx_y) - Math.abs(yy_y);
    const h_z = 1.0 - Math.abs(xx_z) - Math.abs(yy_z);
    const h_w = 1.0 - Math.abs(xx_w) - Math.abs(yy_w);

    const b0_x = xx_x; const b0_y = xx_y; const b0_z = yy_x; const b0_w = yy_y;
    const b1_x = xx_z; const b1_y = xx_w; const b1_z = yy_z; const b1_w = yy_w;

    const s0_x = Math.floor(b0_x) * 2.0 + 1.0;
    const s0_y = Math.floor(b0_y) * 2.0 + 1.0;
    const s0_z = Math.floor(b0_z) * 2.0 + 1.0;
    const s0_w = Math.floor(b0_w) * 2.0 + 1.0;

    const s1_x = Math.floor(b1_x) * 2.0 + 1.0;
    const s1_y = Math.floor(b1_y) * 2.0 + 1.0;
    const s1_z = Math.floor(b1_z) * 2.0 + 1.0;
    const s1_w = Math.floor(b1_w) * 2.0 + 1.0;

    const sh_x = h_x < 0.0 ? -1.0 : 0.0;
    const sh_y = h_y < 0.0 ? -1.0 : 0.0;
    const sh_z = h_z < 0.0 ? -1.0 : 0.0;
    const sh_w = h_w < 0.0 ? -1.0 : 0.0;

    const a0_x = b0_x + s0_x * sh_x;
    const a0_y = b0_z + s0_z * sh_x;
    const a0_z = b0_y + s0_y * sh_y;
    const a0_w = b0_w + s0_w * sh_y;

    const a1_x = b1_x + s1_x * sh_z;
    const a1_y = b1_z + s1_z * sh_z;
    const a1_z = b1_y + s1_y * sh_w;
    const a1_w = b1_w + s1_w * sh_w;

    let p0_x = a0_x; let p0_y = a0_y; let p0_z = h_x;
    let p1_x = a0_z; let p1_y = a0_w; let p1_z = h_y;
    let p2_x = a1_x; let p2_y = a1_y; let p2_z = h_z;
    let p3_x = a1_z; let p3_y = a1_w; let p3_z = h_w;

    const norm_x = taylorInvSqrt(p0_x * p0_x + p0_y * p0_y + p0_z * p0_z);
    const norm_y = taylorInvSqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
    const norm_z = taylorInvSqrt(p2_x * p2_x + p2_y * p2_y + p2_z * p2_z);
    const norm_w = taylorInvSqrt(p3_x * p3_x + p3_y * p3_y + p3_z * p3_z);

    p0_x *= norm_x; p0_y *= norm_x; p0_z *= norm_x;
    p1_x *= norm_y; p1_y *= norm_y; p1_z *= norm_y;
    p2_x *= norm_z; p2_y *= norm_z; p2_z *= norm_z;
    p3_x *= norm_w; p3_y *= norm_w; p3_z *= norm_w;

    let m_x = Math.max(0.6 - (x0_x * x0_x + x0_y * x0_y + x0_z * x0_z), 0.0);
    let m_y = Math.max(0.6 - (x1_x * x1_x + x1_y * x1_y + x1_z * x1_z), 0.0);
    let m_z = Math.max(0.6 - (x2_x * x2_x + x2_y * x2_y + x2_z * x2_z), 0.0);
    let m_w = Math.max(0.6 - (x3_x * x3_x + x3_y * x3_y + x3_z * x3_z), 0.0);

    m_x *= m_x; m_y *= m_y; m_z *= m_z; m_w *= m_w;
    m_x *= m_x; m_y *= m_y; m_z *= m_z; m_w *= m_w;

    return 42.0 * (
        m_x * (p0_x * x0_x + p0_y * x0_y + p0_z * x0_z) +
        m_y * (p1_x * x1_x + p1_y * x1_y + p1_z * x1_z) +
        m_z * (p2_x * x2_x + p2_y * x2_y + p2_z * x2_z) +
        m_w * (p3_x * x3_x + p3_y * x3_y + p3_z * x3_z)
    );
}
