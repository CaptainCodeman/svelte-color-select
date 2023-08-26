<script lang="ts">
	import type { Okhsv, Okhsl, Oklab, Oklch, Rgb } from 'culori'
	import {
		useMode,
		modeOklab,
		modeOklch,
		modeOkhsl,
		modeOkhsv,
		convertOkhsvToOklab,
		convertOklabToRgb,
	} from 'culori/fn'
	import { createEventDispatcher } from 'svelte'
	import {
		eps,
		picker_size,
		slider_width,
		border_size,
		gap_size,
	} from './constants'
	import { render_main_image, render_slider_image } from './render'
	import type { ConvertFn } from 'culori/src/converter'

	export type Color = Okhsl | Okhsv | Oklab | Oklch | Rgb
	export let color: Color

	export let transform = (rgb: Rgb) => rgb

	const dispatch = createEventDispatcher()
	const width = picker_size + slider_width + gap_size + border_size * 2
	const height = picker_size + border_size * 2

	const toOkhsl = useMode(modeOkhsl)
	const toOkhsv = useMode(modeOkhsv)
	const toOklab = useMode(modeOklab)
	const toOklch = useMode(modeOklch)

	$: mode = color.mode
	$: convertToInternal = convertToInternalFn(mode) as ConvertFn<'okhsv'>
	$: convertToOutput = convertToOutputFn(mode) as ConvertFn
	$: okhsv = convertToInternal(color)
	$: uihsv = scale_to_ui(okhsv)
	$: update_square(okhsv.h ?? 0)

	// used to prevent re-drawing square for minor hue changes
	let prev_h = 0

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let image: ImageData

	function render_square(node: HTMLCanvasElement) {
		canvas = node
		ctx = canvas.getContext('2d')!
		image = ctx.getImageData(0, 0, canvas.width, canvas.height)

		update_square(okhsv.h ?? 0)
	}

	function update_square(h: number) {
		if (!canvas) return

		if (Math.abs(h - prev_h) > eps) {
			render_main_image(h, image, transform)
			ctx.putImageData(image, 0, 0)
		}

		prev_h = h
	}

	function render_slider(node: HTMLCanvasElement) {
		const image = render_slider_image()
		let ctx = node.getContext('2d')!
		ctx.putImageData(image, 0, 0)
	}

	function scale_to_ui(okhsv: Okhsv): Okhsv {
		return {
			mode: 'okhsv',
			h: clamp_ui((okhsv.h ?? 0) / 360),
			s: clamp_ui(okhsv.s),
			v: clamp_ui(1 - okhsv.v),
		}
	}

	function clamp(x: number) {
		return x < eps ? eps : x > 1 - eps ? 1 - eps : x
	}

	function clamp_ui(value: number) {
		return value < 0 ? 0 : value > 1 ? picker_size : value * picker_size
	}

	// return a fn that will convert from the output color mode to the internal okhsv
	function convertToInternalFn(colorMode: "okhsl" | "okhsv" | "oklab" | "oklch" | "rgb") {
		switch (colorMode) {
			case 'okhsl':
				return toOkhsv
			case 'okhsv':
				return toOkhsv
			case 'oklab':
				return toOkhsv
			case 'oklch':
				return toOkhsv
			case 'rgb':
				return toOkhsv
		}
	}

	// return a fn that will convert from the internal okkhsv to the output color mode
	function convertToOutputFn(colorMode: "okhsl" | "okhsv" | "oklab" | "oklch" | "rgb") {
		switch (colorMode) {
			case 'okhsl':
				return toOkhsl
			case 'okhsv':
				return toOkhsv
			case 'oklab':
				return toOklab
			case 'oklch':
				return toOklch
			case 'rgb':
				return (color: Okhsv) => convertOklabToRgb(convertOkhsvToOklab(color))
		}
	}

	async function update_rgb() {
		color = convertToOutput(okhsv)
		dispatch('change', { color })
	}

	function update_sv(x: number, y: number) {
		let new_s = clamp(x / picker_size)
		let new_v = clamp(1 - y / picker_size)

		okhsv.s = new_s
		okhsv.v = new_v

		update_rgb()
	}

	function update_h(x: number, y: number) {
		let h = clamp(y / picker_size)
		okhsv.h = h * 360

		update_rgb()
	}

	function pointer(
		node: HTMLCanvasElement,
		fn: (x: number, y: number) => void
	) {
		let active = false

		function update(event: PointerEvent) {
			const x = event.offsetX
			const y = event.offsetY
			fn(x, y)
		}

		function onpointerdown(event: PointerEvent) {
			event.stopPropagation()
			node.setPointerCapture(event.pointerId)
			update(event)
			active = true
		}

		function onpointermove(event: PointerEvent) {
			event.stopPropagation()
			if (active) {
				update(event)
			}
		}

		function onpointerend(event: PointerEvent) {
			event.stopPropagation()
			node.releasePointerCapture(event.pointerId)
			active = false
		}

		node.addEventListener('pointerdown', onpointerdown, { passive: true })
		node.addEventListener('pointermove', onpointermove, { passive: true })
		node.addEventListener('pointerup', onpointerend, { passive: true })
		node.addEventListener('pointercancel', onpointerend, { passive: true })

		return {
			destroy() {
				node.removeEventListener('pointerdown', onpointerdown)
				node.removeEventListener('pointermove', onpointermove)
				node.removeEventListener('pointerup', onpointerend)
				node.removeEventListener('pointercancel', onpointerend)
			},
		}
	}

	function onKeydown(event: KeyboardEvent) {
		const keyHandled = () => {
			event.preventDefault()
			event.stopPropagation()
		}

		const step = event.shiftKey ? 10 : 1

		switch (event.key) {
			case 'ArrowUp':
				if (event.altKey) {
					update_h(0, Math.round(uihsv.h! - step))
				} else {
					update_sv(uihsv.s, Math.round(uihsv.v - step))
				}
				keyHandled()
				break

			case 'ArrowDown':
				if (event.altKey) {
					update_h(0, Math.round(uihsv.h! + step))
				} else {
					update_sv(uihsv.s, Math.round(uihsv.v + step))
				}
				keyHandled()
				break

			case 'ArrowLeft':
				update_sv(Math.round(uihsv.s - step), uihsv.v)
				keyHandled()
				break

			case 'ArrowRight':
				update_sv(Math.round(uihsv.s + step), uihsv.v)
				keyHandled()
				break
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={$$props.class}
	tabindex="0"
	style:width="{width}px"
	style:height="{height}px"
	on:keydown={onKeydown}
>
	<canvas
		id="okhsv_sv_canvas"
		width={picker_size}
		height={picker_size}
		style:top="{border_size}px"
		style:left="{border_size}px"
		use:pointer={update_sv}
		use:render_square
	/>
	<canvas
		width={slider_width}
		height={picker_size}
		style:top="{border_size}px"
		style:left="{picker_size + gap_size}px"
		use:pointer={update_h}
		use:render_slider
	/>

	<svg {width} {height}>
		<g transform="translate({border_size},{border_size})">
			<g transform="translate({uihsv.s},{uihsv.v})">
				<circle
					cx="0"
					cy="0"
					r="5"
					fill="none"
					stroke-width="1.75"
					stroke="#fff"
				/>
				<circle
					cx="0"
					cy="0"
					r="6"
					fill="none"
					stroke-width="1.25"
					stroke="#000"
				/>
			</g>
		</g>
		<g transform="translate({picker_size + gap_size},{border_size})">
			<g transform="translate(0,{uihsv.h})">
				<polygon
					points="-7,-4 -1,0 -7,4"
					fill="#fff"
					stroke-width="0.8"
					stroke="#000"
				/>
				<polygon
					points="{slider_width + 7},-4 {slider_width + 1},0 {slider_width +
						7},4"
					fill="#fff"
					stroke-width="0.8"
					stroke="#000"
				/>
			</g>
		</g>
	</svg>
</div>

<style>
	div {
		position: relative;
		outline: 0;
	}

	canvas,
	svg {
		touch-action: none;
		position: absolute;
	}

	svg {
		pointer-events: none;
	}
</style>
