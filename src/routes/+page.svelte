<script lang="ts">
	import ColorSelect from '$lib'
	import { thread, threadColor } from '$lib/dmc/color-lookup'
	import { textColorHex, textColorRGB } from '$lib/dmc/palette'

	let r = 131
	let g = 66
	let b = 58

	const transform = (rgb: number[]) => threadColor(rgb).map(x => x * 255)

	$: dmc = thread([r, g, b])
	$: hex = [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')
</script>

<svelte:head>
	<title>Okhsv Color Select</title>
</svelte:head>

<h1 class="text-zinc-100 mx-8 mt-16 font-extrabold text-3xl">Okhsv Color Select</h1>
<p class="text-zinc-400 mx-8 mt-2">HSV style color select using OKLab perceptual color space.</p>

<div class="flex gap-2">
	<ColorSelect class="m-8 bg-zinc-600" bind:r bind:g bind:b {transform} />

	<!-- <p class="text-zinc-400 mx-8 mt-2">Use left / right arrow keys to adjust Saturation, up / down to adjust Brightness.</p>
<p class="text-zinc-400 mx-8 mt-2">Hold shift for larger steps and alt / option key to adjust Hue.</p> -->

	<div class="mt-8">
		<div class="flex items-center mt-2 red">
			<label class="w-24 text-red-700" for="red">Red</label>
			<input id="red" type="range" min="0" max="255" step="1" bind:value={r} />
			<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right font-mono tabular-nums">{Math.round(r)}</span>
		</div>

		<div class="flex items-center mt-2 green">
			<label class="w-24 text-green-600" for="green">Green</label>
			<input id="green" type="range" min="0" max="255" step="1" bind:value={g} />
			<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right font-mono tabular-nums">{Math.round(g)}</span>
		</div>

		<div class="flex items-center mt-2 blue">
			<label class="w-24 text-blue-600" for="blue">Blue</label>
			<input id="blue" type="range" min="0" max="255" step="1" bind:value={b} />
			<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right font-mono tabular-nums">{Math.round(b)}</span>
		</div>

		<div class="w-48 bg-white ml-24 my-6 rounded-[10px] flex">
			<div
				class="w-24 h-12 m-1 mr-0.5 rounded-l-[6px] flex items-center justify-center text-sm font-mono tabular-nums"
				style:color={textColorHex(hex)}
				style:background-color="rgb({r},{g},{b})"
			>
				#{hex}
			</div>
			<div
				class="w-24 h-12 m-1 ml-0.5 rounded-r-[6px] flex items-center justify-center font-mono tabular-nums"
				style:color={textColorRGB(dmc.rgb[0] * 255, dmc.rgb[1] * 255, dmc.rgb[2] * 255)}
				style:background-color="rgb({dmc.rgb[0] * 100}%,{dmc.rgb[1] * 100}%,{dmc.rgb[2] * 100}%)"
			>
				{dmc.code}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	input[type='range'] {
		@apply flex-grow h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 12px;
		appearance: none;
		height: 12px;
		cursor: ew-resize;
		border-radius: 50%;
	}

	.red input[type='range']::-webkit-slider-thumb {
		@apply bg-red-700;
	}

	.green input[type='range']::-webkit-slider-thumb {
		@apply bg-green-600;
	}

	.blue input[type='range']::-webkit-slider-thumb {
		@apply bg-blue-600;
	}
</style>
