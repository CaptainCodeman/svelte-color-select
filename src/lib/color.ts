import { convert, OKHSL, OKHSV, OKLab, sRGB } from '@texel/color'

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

export interface OKhsl {
	h: number
	s: number
	l: number
}

export function oklab_to_okhsv(oklab: OKlab): OKhsv {
	const [h, s, v] = convert([oklab.l, oklab.a, oklab.b], OKLab, OKHSV)
	return { h: h ?? 0, s, v }
}

export function okhsv_to_rgb(okhsv: OKhsv): RGB {
	const [r, g, b] = convert([okhsv.h, okhsv.s, okhsv.v], OKHSV, sRGB)
	return { r, g, b }
}

export function okhsv_to_oklab(okhsv: OKhsv): OKlab {
	const [l, a, b] = convert([okhsv.h, okhsv.s, okhsv.v], OKHSV, OKLab)
	return { l, a, b }
}

export function rgb_to_okhsv(rgb: RGB): OKhsv {
	const [h, s, v] = convert([rgb.r, rgb.g, rgb.b], sRGB, OKHSV)
	return { h, s, v }
}

export function okhsl_to_rgb(okhsl: OKhsl): RGB {
	const [r, g, b] = convert([okhsl.h, okhsl.s, okhsl.l], OKHSL, sRGB)
	return { r, g, b }
}