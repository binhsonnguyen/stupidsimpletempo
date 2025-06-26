// src/lib/components/time-notation-selector/visibilityStore.ts
import { writable } from 'svelte/store';

const HIDE_DELAY = 1000;

function createVisibilityStore() {
	const { subscribe, set } = writable(true);
	let hideTimer: number;

	function startHideTimer() {
		clearTimeout(hideTimer);
		hideTimer = window.setTimeout(() => {
			set(false);
		}, HIDE_DELAY);
	}

	function cancelHideTimer() {
		clearTimeout(hideTimer);
	}

	return {
		subscribe,
		show: () => {
			cancelHideTimer();
			set(true);
			startHideTimer();
		},
		startHideTimer,
		cancelHideTimer
	};
}

export const filmStripVisibilityStore = createVisibilityStore();