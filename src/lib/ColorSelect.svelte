<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import {
		eps,
		picker_size,
		slider_width,
		border_size,
		gap_size,
	} from './constants'
	import { render_main_image, render_slider_image } from './render'
	import type { RGB, OKlab, OKhsv } from './color'
	import {
		oklab_to_okhsv,
		rgb_to_oklab,
		okhsv_to_oklab,
		oklab_to_rgb,
		clamp_color,
	} from './color'

	export let rgb: RGB | undefined = undefined
	export let oklab: OKlab | undefined = undefined
	export let okhsv: OKhsv | undefined = undefined

	const dispatch = createEventDispatcher()
	const width = picker_size + slider_width + gap_size + border_size * 2
	const height = picker_size + border_size * 2

	$: color = convertToInternal(rgb, oklab, okhsv)
	$: uihsv = scale_to_ui(color)

	function scale_to_ui(okhsv: OKhsv): OKhsv {
		return {
			h: clamp_ui(okhsv.h / 360),
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

	function convertToInternal(
		rgb: RGB | undefined,
		oklab: OKlab | undefined,
		okhsv: OKhsv | undefined
	) {
		if (okhsv) {
			return clamp_color(okhsv)
		}

		if (oklab) {
			return clamp_color(oklab_to_okhsv(oklab))
		}

		if (rgb) {
			return clamp_color(oklab_to_okhsv(rgb_to_oklab(rgb)))
		}

		throw 'rgb, oklab, or okhsv required'
	}

	async function update_input() {
		if (okhsv) {
			okhsv = color
			dispatch('change', { okhsv })
		}

		if (oklab) {
			oklab = okhsv_to_oklab(color)
			dispatch('change', { oklab })
		}

		if (rgb) {
			rgb = oklab_to_rgb(okhsv_to_oklab(color))
			dispatch('change', { rgb })
		}
	}

	function update_sv(x: number, y: number) {
		let new_s = clamp(x / picker_size)
		let new_v = clamp(1 - y / picker_size)

		color.s = new_s
		color.v = new_v

		update_input()
	}

	function update_h(x: number, y: number) {
		let h = clamp(y / picker_size)
		color.h = h * 360

		update_input()
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
		use:render_main_image={color.h}
	/>
	<canvas
		width={slider_width}
		height={picker_size}
		style:top="{border_size}px"
		style:left="{picker_size + gap_size}px"
		use:pointer={update_h}
		use:render_slider_image
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
