<script lang="ts">
	import { formatCss, type Rgb } from 'culori/fn'
	import ColorSelect from '$lib'

	// https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416
	let color: Rgb = { mode: 'rgb', r: 0.4, g: 0.2, b: 0.6 } 
</script>

<svelte:head>
	<title>Okhsv Color Select</title>
</svelte:head>

<h1 class="text-zinc-100 mx-8 mt-16 font-extrabold text-3xl">Okhsv Color Select</h1>
<p class="text-zinc-400 mx-8 mt-2">HSV style color select using OKLab perceptual color space.</p>

<ColorSelect class="m-8 bg-zinc-600" bind:color />

<p class="text-zinc-400 mx-8 mt-2">Use left / right arrow keys to adjust Saturation, up / down to adjust Brightness.</p>
<p class="text-zinc-400 mx-8 mt-2">Hold shift for larger steps and alt / option key to adjust Hue.</p>

<div class="m-12">
	<div class="flex items-center mt-2">
		<label class="w-24 text-red-700" for="red">Red</label>
		<input id="red" type="range" min="0" max="1" step={1/255} bind:value={color.r} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(255 * color.r)}</span>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24 text-green-600" for="green">Green</label>
		<input id="green" type="range" min="0" max="1" step={1/255} bind:value={color.g} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(255 * color.g)}</span>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24 text-blue-600" for="blue">Blue</label>
		<input id="blue" type="range" min="0" max="1" step={1/255} bind:value={color.b} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(255 * color.b)}</span>
	</div>

	<div class="bg-white inline-block ml-24 my-6 rounded-[10px]">
		<div class="w-48 h-12 m-1 rounded-[6px]" style:background-color={formatCss(color)} />
	</div>

	<p class="text-white">See <a class="text-blue-300" href="https://bottosson.github.io/posts/colorpicker/">Okhsv and Okhsl by Björn Ottosson</a></p>
</div>
