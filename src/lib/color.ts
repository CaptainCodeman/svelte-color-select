import {
  convertOklabToRgb,
  convertOkhsvToOklab,
  convertRgbToOklab,
  convertOklabToOkhsv,
} from 'culori/fn'


export interface RGB {
  r: number
  g: number
  b: number
}

export interface OKlab {
  l: number
  a: number
  b: number
}

export interface OKhsv {
  h: number
  s: number
  v: number
}

export function oklab_to_rgb(oklab: OKlab): RGB {
  return convertOklabToRgb(oklab)
}

export function oklab_to_okhsv(oklab: OKlab): OKhsv {
  const { h, s, v } = convertOklabToOkhsv(oklab)
  return { h: h ?? 0, s, v }
}

export function okhsv_to_oklab(okhsv: OKhsv): OKlab {
  return convertOkhsvToOklab(okhsv)
}

export function rgb_to_oklab(rgb: RGB): OKlab {
  return convertRgbToOklab(rgb)
}
