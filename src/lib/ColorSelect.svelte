<script lang="ts">
	import { okhsv_to_srgb, srgb_to_okhsv } from './colorconversion'
	import { eps, picker_size, slider_width, border_size, gap_size } from './constants'
	import { render_main_image, render_slider_image } from './render'

	export let r = 0
	export let g = 0
	export let b = 0

	const width = picker_size + slider_width + gap_size + border_size * 2
	const height = picker_size + border_size * 2

	$: okhsv = srgb_to_okhsv(r, g, b)
	$: x = picker_size * okhsv[1]
	$: y = picker_size * (1 - okhsv[2])
	$: v = Math.round(picker_size * okhsv[0])

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	function render_square(node: HTMLCanvasElement) {
		canvas = node
		ctx = canvas.getContext('2d')!

		update_sv(x, y)
	}

	function render_slider(node: HTMLCanvasElement) {
		const image = render_slider_image()
		let ctx = node.getContext('2d')!
		ctx.putImageData(image, 0, 0)
	}

	function clamp(x: number) {
		return x < eps ? eps : x > 1 - eps ? 1 - eps : x
	}

	function clamp255(value: number) {
		return value < 0 ? 0 : value > 255 ? 255 : value
	}

	function update_square(h: number, s: number, v: number) {
		const rgb = okhsv_to_srgb(h, s, v)

		r = rgb[0]
		g = rgb[1]
		b = rgb[2]

		const image = render_main_image(r, g, b)
		ctx.putImageData(image, 0, 0)
	}

	function update_sv(x: number, y: number) {
		let new_s = clamp(x / picker_size)
		let new_v = clamp(1 - y / picker_size)
		update_square(okhsv[0], new_s, new_v)
	}

	function update_h(x: number, y: number) {
		let h = clamp(y / picker_size)
		update_square(h, okhsv[1], okhsv[2])
	}

	function pointer(node: HTMLCanvasElement, fn: (x: number, y: number) => void) {
		function update(event: PointerEvent) {
			const rect = node.getBoundingClientRect()
			const x = clamp255(event.clientX - rect.left)
			const y = clamp255(event.clientY - rect.top)
			fn(x, y)
		}

		node.onpointerdown = event => {
			node.setPointerCapture(event.pointerId)
			update(event)

			node.onpointermove = update

			node.onpointerup = event => {
				node.onpointermove = null
				node.onpointerup = null
			}
		}
	}

	function onKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 1
		console.log(event.key, step)
		switch (event.key) {
			case 'ArrowUp':
				if (event.altKey) {
					update_h(x, Math.round(v - step))
				} else {
					update_sv(x, Math.round(y - step))
				}
				break
			case 'ArrowDown':
				if (event.altKey) {
					update_h(x, Math.round(v + step))
				} else {
					update_sv(x, Math.round(y + step))
				}
				break
			case 'ArrowLeft':
				update_sv(Math.round(x - step), y)
				break
			case 'ArrowRight':
				update_sv(Math.round(x + step), y)
				break
		}
	}
</script>

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
		<g transform="translate({border_size + 0.5},{border_size + 0.5})">
			<g transform="translate({x},{y})">
				<circle cx="0" cy="0" r="5" fill="none" stroke-width="1.75" stroke="#fff" />
				<circle cx="0" cy="0" r="6" fill="none" stroke-width="1.25" stroke="#000" />
			</g>
		</g>
		<g transform="translate({picker_size + gap_size},{border_size + 0.5})">
			<g transform="translate(0,{v})">
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
		position: absolute;
	}

	svg {
		pointer-events: none;
	}
</style>
