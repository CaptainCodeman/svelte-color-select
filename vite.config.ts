import glsl from 'vite-plugin-glsl'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		glsl({ compress: true }),
		sveltekit(),
	]
})
