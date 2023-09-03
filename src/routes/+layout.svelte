<script lang="ts">
	import { page } from '$app/stores'
</script>

<svelte:head>
	<title>Okhsv Color Select</title>
</svelte:head>

<h1 class="text-zinc-100 mx-8 mt-16 font-extrabold text-3xl">
	Okhsv Color Select
</h1>
<p class="text-zinc-400 mx-8 mt-2">
	HSV style color select using OKLab perceptual color space.
</p>

<nav class="nav">
	<li>
		<a href="/" aria-current={$page.url.pathname === '/' ? 'page' : undefined}
			>sRGB</a
		>
	</li>
	<li>
		<a
			href="/oklab"
			aria-current={$page.url.pathname === '/oklab' ? 'page' : undefined}
			>Oklab</a
		>
	</li>
</nav>

<slot />

<style>
	.nav {
		align-items: center;
		display: flex;
		gap: 1rem;
		list-style: none;
		margin-bottom: 2rem;
		margin-top: 2rem;
		padding-left: 2rem;
		padding-right: 2rem;
	}

	.nav a {
		border-bottom: 2px solid transparent;
		display: flex;
		font-weight: 600;
	}

	.nav a[aria-current='page'] {
		border-bottom-color: currentColor;
	}
</style>
