<script lang="ts">
	import { okhsv_to_srgb, srgb_to_okhsv } from './colorconversion'
	import { eps, picker_size, slider_width, border_size, gap_size } from './constants'
	import { render_main_image, render_slider_image } from './render'
	import { createEventDispatcher } from 'svelte'

	export let r = 0
	export let g = 0
	export let b = 0

	export let transform = (rgb: number[]) => rgb

	const dispatch = createEventDispatcher()
	const width = picker_size + slider_width + gap_size + border_size * 2
	const height = picker_size + border_size * 2

	$: okhsv = srgb_to_okhsv(r, g, b)
	$: uihsv = scale_to_ui(okhsv)
	$: update_square(okhsv[0])

	// used to prevent re-drawing square for minor hue changes
	let prev_h = 0

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let image: ImageData

	function render_square(node: HTMLCanvasElement) {
		canvas = node
		ctx = canvas.getContext('2d')!
		image = ctx.getImageData(0, 0, canvas.width, canvas.height)

		update_square(okhsv[0])
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

	function scale_to_ui(okhsv: number[]) {
		return [clamp_ui(okhsv[0]), clamp_ui(okhsv[1]), clamp_ui(1 - okhsv[2])]
	}

	function clamp(x: number) {
		return x < eps ? eps : x > 1 - eps ? 1 - eps : x
	}

	function clamp_255(value: number) {
		return value < 0 ? 0 : value > 255 ? 255 : value
	}

	function clamp_ui(value: number) {
		return value < 0 ? 0 : value > 1 ? picker_size : value * picker_size
	}

	async function update_rgb() {
		const rgb = okhsv_to_srgb(okhsv[0], okhsv[1], okhsv[2]).map(clamp_255)

		r = rgb[0]
		g = rgb[1]
		b = rgb[2]

		dispatch('change', { rgb, okhsv })
	}

	function update_sv(x: number, y: number) {
		let new_s = clamp(x / picker_size)
		let new_v = clamp(1 - y / picker_size)

		okhsv[1] = new_s
		okhsv[2] = new_v

		update_rgb()
	}

	function update_h(x: number, y: number) {
		let h = clamp(y / picker_size)
		okhsv[0] = h

		update_rgb()
	}

	function pointer(node: HTMLCanvasElement, fn: (x: number, y: number) => void) {
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
					update_h(0, Math.round(uihsv[0] - step))
				} else {
					update_sv(uihsv[1], Math.round(uihsv[2] - step))
				}
				keyHandled()
				break

			case 'ArrowDown':
				if (event.altKey) {
					update_h(0, Math.round(uihsv[0] + step))
				} else {
					update_sv(uihsv[1], Math.round(uihsv[2] + step))
				}
				keyHandled()
				break

			case 'ArrowLeft':
				update_sv(Math.round(uihsv[1] - step), uihsv[2])
				keyHandled()
				break

			case 'ArrowRight':
				update_sv(Math.round(uihsv[1] + step), uihsv[2])
				keyHandled()
				break
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class={$$props.class} tabindex="0" style:width="{width}px" style:height="{height}px" on:keydown={onKeydown}>
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
			<g transform="translate({uihsv[1]},{uihsv[2]})">
				<circle cx="0" cy="0" r="5" fill="none" stroke-width="1.75" stroke="#fff" />
				<circle cx="0" cy="0" r="6" fill="none" stroke-width="1.25" stroke="#000" />
			</g>
		</g>
		<g transform="translate({picker_size + gap_size},{border_size})">
			<g transform="translate(0,{uihsv[0]})">
				<polygon points="-7,-4 -1,0 -7,4" fill="#fff" stroke-width="0.8" stroke="#000" />
				<polygon points="{slider_width + 7},-4 {slider_width + 1},0 {slider_width + 7},4" fill="#fff" stroke-width="0.8" stroke="#000" />
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
