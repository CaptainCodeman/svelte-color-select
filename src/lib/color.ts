import {
	convertOklabToRgb,
	convertOkhsvToOklab,
	convertRgbToOklab,
	convertOklabToOkhsv,
	convertOkhslToOklab,
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

export interface OKhsl {
	h: number
	s: number
	l: number
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

export function okhsl_to_oklab(okhsl: OKhsl): OKlab {
	return convertOkhslToOklab(okhsl)
}

export function clamp_color(okhsv: OKhsv): OKhsv {
	// only clamp if necessary
	if (okhsv.s > 1 || okhsv.v > 1) {
		const { r, g, b } = oklab_to_rgb(okhsv_to_oklab(okhsv))
		return oklab_to_okhsv(
			rgb_to_oklab({
				r: Math.max(Math.min(r, 1), 0),
				g: Math.max(Math.min(g, 1), 0),
				b: Math.max(Math.min(b, 1), 0),
			})
		)
	}
	return okhsv
}
