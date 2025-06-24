// src/lib/services/wakeLockService.ts

import { browser } from '$app/environment';

let wakeLockSentinel: WakeLockSentinel | null = null;

const requestWakeLock = async () => {
	if (wakeLockSentinel) return;

	try {
		wakeLockSentinel = await navigator.wakeLock.request('screen');
		console.log('Screen Wake Lock is active.');

		wakeLockSentinel.addEventListener('release', () => {
			console.log('Screen Wake Lock was released by the browser.');
			wakeLockSentinel = null;
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
		} else {
			console.error('An unknown error occurred while requesting Wake Lock.');
		}
	}
};

const initialize = () => {
	if (!browser || !('wakeLock' in navigator)) {
		if (browser) {
			console.warn('Screen Wake Lock API is not supported in this browser.');
		}
		return;
	}

	const handleVisibilityChange = async () => {
		if (document.visibilityState === 'visible') {
			await requestWakeLock();
		}
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	requestWakeLock();
};

export const wakeLockService = {
	initialize
};