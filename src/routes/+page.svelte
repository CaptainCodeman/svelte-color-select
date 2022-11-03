<script lang="ts">
	import ColorSelect from '$lib'

	// https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416
	let r = 102
	let g = 51
	let b = 153
</script>

<svelte:head>
	<title>Okhsv Color Select</title>
</svelte:head>

<h1 class="text-zinc-100 mx-8 mt-16 font-extrabold text-3xl">Okhsv Color Select</h1>
<p class="text-zinc-400 mx-8 mt-2">HSV style color select using OKLab perceptual color space.</p>

<ColorSelect class="m-8 bg-zinc-600" bind:r bind:g bind:b />

<p class="text-zinc-400 mx-8 mt-2">Use left / right arrow keys to adjust Saturation, up / down to adjust Brightness.</p>
<p class="text-zinc-400 mx-8 mt-2">Hold shift for larger steps and alt / option key to adjust Hue.</p>

<div class="m-12">
	<div class="flex items-center mt-2">
		<label class="w-24 text-red-700" for="red">Red</label>
		<input id="red" type="range" min="0" max="255" step="1" bind:value={r} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(r)}</span>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24 text-green-600" for="green">Green</label>
		<input id="green" type="range" min="0" max="255" step="1" bind:value={g} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(g)}</span>
	</div>

	<div class="flex items-center mt-2">
		<label class="w-24 text-blue-600" for="blue">Blue</label>
		<input id="blue" type="range" min="0" max="255" step="1" bind:value={b} />
		<span class="text-sm font-semibold text-zinc-300 w-12 ml-2 pl-2 py-0.5 pr-0 text-right">{Math.round(b)}</span>
	</div>

	<div class="bg-white inline-block ml-24 my-6 rounded-[10px]">
		<div class="w-48 h-12 m-1 rounded-[6px]" style:background-color="rgb({r},{g},{b})" />
	</div>

	<p class="text-white">See <a class="text-blue-300" href="https://bottosson.github.io/posts/colorpicker/">Okhsv and Okhsl by Björn Ottosson</a></p>
</div>
