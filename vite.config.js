import { defineConfig, normalizePath } from 'vite'
import { basename, join, resolve } from 'path';

const buildDirectory = 'dist';
const themeDirName = basename(__dirname);

export default defineConfig({
	esbuild: {
		minifyIdentifiers: false,
		keepNames: true,
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'source/x4fit.schedules.js'),
			name: 'x4',
			// the proper extensions will be added
			fileName: 'x4fit.schedules',
		},
		rollupOptions: {
			// external: ['moment'],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				// globals: {
				// 	vue: 'x4',
				// },
			},
		},
	}
})