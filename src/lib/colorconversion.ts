function srgb_transfer_function(a: number) {
  return .0031308 >= a ? 12.92 * a : 1.055 * Math.pow(a, .4166666666666667) - .055
}

function srgb_transfer_function_inv(a: number) {
  return .04045 < a ? Math.pow((a + .055) / 1.055, 2.4) : a / 12.92
}

function linear_srgb_to_oklab(r: number, g: number, b: number) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ]
}

function oklab_to_linear_srgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  return [
    (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    (-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    (-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

function toe(x: number) {
  const k_1 = 0.206
  const k_2 = 0.03
  const k_3 = (1 + k_1) / (1 + k_2)

  return 0.5 * (k_3 * x - k_1 + Math.sqrt((k_3 * x - k_1) * (k_3 * x - k_1) + 4 * k_2 * k_3 * x))
}

function toe_inv(x: number) {
  const k_1 = 0.206
  const k_2 = 0.03
  const k_3 = (1 + k_1) / (1 + k_2)
  return (x * x + k_1 * x) / (k_3 * (x + k_2))
}

// Finds the maximum saturation possible for a given hue that fits in sRGB
// Saturation here is defined as S = C/L
// a and b must be normalized so a^2 + b^2 == 1
function compute_max_saturation(a: number, b: number) {
  // Max saturation will be when one of r, g or b goes below zero.

  // Select different coefficients depending on which component goes below zero first
  let k0, k1, k2, k3, k4, wl, wm, ws

  if (-1.88170328 * a - 0.80936493 * b > 1) {
    // Red component
    k0 = +1.19086277
    k1 = +1.76576728
    k2 = +0.59662641
    k3 = +0.75515197
    k4 = +0.56771245
    wl = +4.0767416621
    wm = -3.3077115913
    ws = +0.2309699292
  }
  else if (1.81444104 * a - 1.19445276 * b > 1) {
    // Green component
    k0 = +0.73956515
    k1 = -0.45954404
    k2 = +0.08285427
    k3 = +0.12541070
    k4 = +0.14503204
    wl = -1.2684380046
    wm = +2.6097574011
    ws = -0.3413193965
  }
  else {
    // Blue component
    k0 = +1.35733652
    k1 = -0.00915799
    k2 = -1.15130210
    k3 = -0.50559606
    k4 = +0.00692167
    wl = -0.0041960863
    wm = -0.7034186147
    ws = +1.7076147010
  }

  // Approximate max saturation using a polynomial:
  let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b

  // Do one step Halley's method to get closer
  // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
  // this should be sufficient for most applications, otherwise do two/three steps

  const k_l = +0.3963377774 * a + 0.2158037573 * b
  const k_m = -0.1055613458 * a - 0.0638541728 * b
  const k_s = -0.0894841775 * a - 1.2914855480 * b

  {
    const l_ = 1 + S * k_l
    const m_ = 1 + S * k_m
    const s_ = 1 + S * k_s

    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_

    const l_dS = 3 * k_l * l_ * l_
    const m_dS = 3 * k_m * m_ * m_
    const s_dS = 3 * k_s * s_ * s_

    const l_dS2 = 6 * k_l * k_l * l_
    const m_dS2 = 6 * k_m * k_m * m_
    const s_dS2 = 6 * k_s * k_s * s_

    const f = wl * l + wm * m + ws * s
    const f1 = wl * l_dS + wm * m_dS + ws * s_dS
    const f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2

    S = S - f * f1 / (f1 * f1 - 0.5 * f * f2)
  }

  return S
}

function find_cusp(a: number, b: number) {
  // First, find the maximum saturation (saturation S = C/L)
  const S_cusp = compute_max_saturation(a, b)

  // Convert to linear sRGB to find the first point where at least one of r,g or b >= 1:
  const rgb_at_max = oklab_to_linear_srgb(1, S_cusp * a, S_cusp * b)
  const L_cusp = Math.cbrt(1 / Math.max(Math.max(rgb_at_max[0], rgb_at_max[1]), rgb_at_max[2]))
  const C_cusp = L_cusp * S_cusp

  return [L_cusp, C_cusp]
}

function get_ST_max(a_: number, b_: number, cusp: number[] | null = null) {
  if (!cusp) {
    cusp = find_cusp(a_, b_)
  }

  const L = cusp[0]
  const C = cusp[1]
  return [C / L, C / (1 - L)]
}

export function okhsv_to_srgb(h: number, s: number, v: number) {
  const a_ = Math.cos(2 * Math.PI * h)
  const b_ = Math.sin(2 * Math.PI * h)

  const ST_max = get_ST_max(a_, b_)
  const S_max = ST_max[0]
  const S_0 = 0.5
  const T = ST_max[1]
  const k = 1 - S_0 / S_max

  const L_v = 1 - s * S_0 / (S_0 + T - T * k * s)
  const C_v = s * T * S_0 / (S_0 + T - T * k * s)

  let L = v * L_v
  let C = v * C_v

  const L_vt = toe_inv(L_v)
  const C_vt = C_v * L_vt / L_v

  const L_new = toe_inv(L) // * L_v/L_vt
  C = C * L_new / L
  L = L_new

  const rgb_scale = oklab_to_linear_srgb(L_vt, a_ * C_vt, b_ * C_vt)
  const scale_L = Math.cbrt(1 / (Math.max(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)))

  // remove to see effect without rescaling
  L = L * scale_L
  C = C * scale_L

  const rgb = oklab_to_linear_srgb(L, C * a_, C * b_)
  return [
    255 * srgb_transfer_function(rgb[0]),
    255 * srgb_transfer_function(rgb[1]),
    255 * srgb_transfer_function(rgb[2]),
  ]
}

export function srgb_to_okhsv(r: number, g: number, b: number) {
  const lab = linear_srgb_to_oklab(
    srgb_transfer_function_inv(r / 255),
    srgb_transfer_function_inv(g / 255),
    srgb_transfer_function_inv(b / 255)
  )

  let C = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2])
  const a_ = lab[1] / C
  const b_ = lab[2] / C

  let L = lab[0]
  const h = 0.5 + 0.5 * Math.atan2(-lab[2], -lab[1]) / Math.PI

  const ST_max = get_ST_max(a_, b_)
  const S_max = ST_max[0]
  const S_0 = 0.5
  const T = ST_max[1]
  const k = 1 - S_0 / S_max

  const t = T / (C + L * T)
  const L_v = t * L
  const C_v = t * C

  const L_vt = toe_inv(L_v)
  const C_vt = C_v * L_vt / L_v

  const rgb_scale = oklab_to_linear_srgb(L_vt, a_ * C_vt, b_ * C_vt)
  const scale_L = Math.cbrt(1 / (Math.max(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)))

  L = L / scale_L
  C = C / scale_L

  C = C * toe(L) / L
  L = toe(L)

  const v = L / L_v
  const s = (S_0 + T) * C_v / ((T * S_0) + T * k * C_v)

  return [h, s, v]
}
