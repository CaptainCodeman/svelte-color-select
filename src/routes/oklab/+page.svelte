<script lang="ts">
	import type { OKlab } from '$lib'
	import ColorSelect from '$lib'
	import { oklab_to_rgb } from '../../lib/color'

	// https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416
	let oklab: OKlab = { l: 0.44, a: 0.088, b: -0.134 }

	$: rgb = oklab_to_rgb(oklab)
	$: oklabDisplay = {
		l: Math.round(1000 * oklab.l) / 1000,
		a: Math.round(100 * oklab.a) / 100,
		b: Math.round(100 * oklab.b) / 100,
	}
</script>

<ColorSelect class="m-8 bg-zinc-600" bind:oklab />

<p class="text-zinc-400 mx-8 mt-2">
	Use left / right arrow keys to adjust Saturation, up / down to adjust
	Brightness.
</p>
<p class="text-zinc-400 mx-8 mt-2">
	Hold shift for larger steps and alt / option key to adjust Hue.
</p>

<div class="m-12">
	<div class="flex items-center mt-2">
		<label class="w-24" for="red">L</label>
		<input
			id="red"
			type="range"
			min="0"
			max="1"
			step={0.01}
			bind:value={oklab.l}
		/>
		<span
			class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right"
			>{oklabDisplay.l}</span
		>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24" for="green">A</label>
		<input
			id="green"
			type="range"
			min="0"
			max="1"
			step={1 / 255}
			bind:value={oklab.a}
		/>
		<span
			class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right"
			>{oklabDisplay.a}</span
		>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24" for="blue">B</label>
		<input
			id="blue"
			type="range"
			min="0"
			max="1"
			step={1 / 255}
			bind:value={oklab.b}
		/>
		<span
			class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right"
			>{oklabDisplay.b}</span
		>
	</div>

	<div class="bg-white inline-block ml-24 my-6 rounded-[10px]">
		<div
			class="w-48 h-12 m-1 rounded-[6px]"
			style:background-color="rgb({255 * rgb.r},{255 * rgb.g},{255 * rgb.b})"
		/>
	</div>

	<p class="text-white">
		See <a
			class="text-blue-300"
			href="https://bottosson.github.io/posts/colorpicker/"
			>Okhsv and Okhsl by Björn Ottosson</a
		>
	</p>
</div>
