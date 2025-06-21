// svelte.config.js

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// mọi yêu cầu đến server (ví dụ: khi người dùng F5 trang ở đường dẫn /about)
			// sẽ được chuyển về index.html
			fallback: 'index.html',
			precompress: false,
			strict: true
		})
	}
};

export default config;