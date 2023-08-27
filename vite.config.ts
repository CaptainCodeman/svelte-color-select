import { sveltekit } from '@sveltejs/kit/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
	switch (mode) {
		case 'development':
		case 'production':
			return {
				plugins: [
					glsl(),
					sveltekit()
				]
			}
		case 'library':
			return {
				plugins: [
					glsl({ compress: true }),
					svelte({ emitCss: false })
				],
				build: {
					lib: {
						entry: 'src/lib/index.ts',
						formats: ['es'],
						fileName: 'index',
					}
				}
			}
		default: throw 'unknown mode'
	}
})
