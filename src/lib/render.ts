import type { Rgb } from 'culori'
import { useMode, modeRgb, modeOkhsl, modeOkhsv } from 'culori/fn'
import { picker_size, slider_width } from './constants'

const lowres_picker_size = Math.round((picker_size + 1) / 2)
const picker_size_inv = 1 / picker_size

useMode(modeOkhsl)
useMode(modeOkhsv)

const toRgb = useMode(modeRgb)

function upscale(lowres_data: Float32Array, data: Uint8ClampedArray) {
	for (let i = 0; i < lowres_picker_size - 1; i++) {
		for (let j = 0; j < lowres_picker_size - 1; j++) {
			const source_index_00 = 3 * (i * lowres_picker_size + j)
			const source_index_01 = 3 * (i * lowres_picker_size + j + 1)
			const source_index_10 = 3 * ((i + 1) * lowres_picker_size + j)
			const source_index_11 = 3 * ((i + 1) * lowres_picker_size + j + 1)

			const r00 = lowres_data[source_index_00 + 0]
			const r01 = lowres_data[source_index_01 + 0]
			const r10 = lowres_data[source_index_10 + 0]
			const r11 = lowres_data[source_index_11 + 0]

			const g00 = lowres_data[source_index_00 + 1]
			const g01 = lowres_data[source_index_01 + 1]
			const g10 = lowres_data[source_index_10 + 1]
			const g11 = lowres_data[source_index_11 + 1]

			const b00 = lowres_data[source_index_00 + 2]
			const b01 = lowres_data[source_index_01 + 2]
			const b10 = lowres_data[source_index_10 + 2]
			const b11 = lowres_data[source_index_11 + 2]

			const target_index_00 = 4 * (2 * i * picker_size + 2 * j)
			const target_index_01 = 4 * (2 * i * picker_size + 2 * j + 1)
			const target_index_10 = 4 * ((2 * i + 1) * picker_size + 2 * j)
			const target_index_11 = 4 * ((2 * i + 1) * picker_size + 2 * j + 1)

			data[target_index_00 + 0] = r00
			data[target_index_00 + 1] = g00
			data[target_index_00 + 2] = b00

			data[target_index_01 + 0] = 0.5 * (r00 + r01)
			data[target_index_01 + 1] = 0.5 * (g00 + g01)
			data[target_index_01 + 2] = 0.5 * (b00 + b01)

			data[target_index_10 + 0] = 0.5 * (r00 + r10)
			data[target_index_10 + 1] = 0.5 * (g00 + g10)
			data[target_index_10 + 2] = 0.5 * (b00 + b10)

			data[target_index_11 + 0] = 0.25 * (r01 + r01 + r10 + r11)
			data[target_index_11 + 1] = 0.25 * (g01 + g01 + g10 + g11)
			data[target_index_11 + 2] = 0.25 * (b01 + b01 + b10 + b11)
		}

		const source_index0 = 3 * (i * lowres_picker_size + lowres_picker_size - 1)
		const source_index1 =
			3 * ((i + 1) * lowres_picker_size + lowres_picker_size - 1)

		const r0 = lowres_data[source_index0 + 0]
		const g0 = lowres_data[source_index0 + 1]
		const b0 = lowres_data[source_index0 + 2]

		const r1 = lowres_data[source_index1 + 0]
		const g1 = lowres_data[source_index1 + 1]
		const b1 = lowres_data[source_index1 + 2]

		const target_index0 = 4 * (2 * i * picker_size + picker_size - 1)
		const target_index1 = 4 * ((2 * i + 1) * picker_size + picker_size - 1)

		data[target_index0 + 0] = r0
		data[target_index0 + 1] = g0
		data[target_index0 + 2] = b0

		data[target_index1 + 0] = 0.5 * (r0 + r1)
		data[target_index1 + 1] = 0.5 * (g0 + g1)
		data[target_index1 + 2] = 0.5 * (b0 + b1)
	}

	for (let j = 0; j < lowres_picker_size - 1; j++) {
		const source_index0 =
			3 * ((lowres_picker_size - 1) * lowres_picker_size + j)
		const source_index1 =
			3 * ((lowres_picker_size - 1) * lowres_picker_size + j + 1)

		const r0 = lowres_data[source_index0 + 0]
		const g0 = lowres_data[source_index0 + 1]
		const b0 = lowres_data[source_index0 + 2]

		const r1 = lowres_data[source_index1 + 0]
		const g1 = lowres_data[source_index1 + 1]
		const b1 = lowres_data[source_index1 + 2]

		const target_index0 = 4 * ((picker_size - 1) * picker_size + 2 * j)
		const target_index1 = 4 * ((picker_size - 1) * picker_size + 2 * j + 1)

		data[target_index0 + 0] = r0
		data[target_index0 + 1] = g0
		data[target_index0 + 2] = b0

		data[target_index1 + 0] = 0.5 * (r0 + r1)
		data[target_index1 + 1] = 0.5 * (g0 + g1)
		data[target_index1 + 2] = 0.5 * (b0 + b1)
	}

	const source_index = 3 * (lowres_picker_size * lowres_picker_size - 1)
	const target_index = 4 * (picker_size * picker_size - 1)

	const r = lowres_data[source_index + 0]
	const g = lowres_data[source_index + 1]
	const b = lowres_data[source_index + 2]

	data[target_index + 0] = r
	data[target_index + 1] = g
	data[target_index + 2] = b
}

export function render_main_image(
	hue: number,
	image: ImageData,
	transform: (rgb: Rgb) => Rgb
) {
	const data = image.data
	const lowres_data = new Float32Array(
		lowres_picker_size * lowres_picker_size * 3
	)

	for (let i = 0; i < lowres_picker_size; i++) {
		for (let j = 0; j < lowres_picker_size; j++) {
			const rgb = toRgb({
				mode: 'okhsv',
				h: hue,
				s: 2 * j * picker_size_inv,
				v: 1 - 2 * i * picker_size_inv,
			})

			const index = 3 * (i * lowres_picker_size + j)
			lowres_data[index + 0] = rgb.r * 255
			lowres_data[index + 1] = rgb.g * 255
			lowres_data[index + 2] = rgb.b * 255
		}
	}

	for (let i = 0; i < picker_size; i++) {
		for (let j = 0; j < picker_size; j++) {
			const index = 4 * (i * picker_size + j)
			data[index + 3] = 255
		}
	}

	upscale(lowres_data, data)
}

export function render_slider_image() {
	const data = new Uint8ClampedArray(picker_size * slider_width * 4)

	for (let i = 0; i < picker_size; i++) {
		const a_ = Math.cos(2 * Math.PI * i * picker_size_inv)
		const b_ = Math.sin(2 * Math.PI * i * picker_size_inv)

		const rgb = toRgb({
			mode: 'okhsl',
			h: 360 * (i * picker_size_inv),
			s: 0.9,
			l: 0.65 + 0.2 * b_ - 0.09 * a_,
		})

		for (let j = 0; j < slider_width; j++) {
			const index = 4 * (i * slider_width + j)
			data[index + 0] = rgb.r * 255
			data[index + 1] = rgb.g * 255
			data[index + 2] = rgb.b * 255
			data[index + 3] = 255
		}
	}

	return new ImageData(data, slider_width)
}
