// src/app.d.ts

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	const __APP_VERSION__: string;
	const __APP_AUTHOR__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace svelteHTML {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface HTMLAttributes<T> {
			'onrotate'?: (event: CustomEvent<number>) => void;
			'ondragend'?: (event: CustomEvent<void>) => void;
			'onswipestart'?: (event: CustomEvent<void>) => void;
			'onswipeend'?: (event: CustomEvent<void>) => void;
			'onswipeup'?: (event: CustomEvent<void>) => void;
			'onswipedown'?: (event: CustomEvent<void>) => void;
			'onswipeleft'?: (event: CustomEvent<void>) => void;
			'onswiperight'?: (event: CustomEvent<void>) => void;
			'ondoubletap'?: (event: CustomEvent<{ angle: number }>) => void;
		}
	}
}

export {};