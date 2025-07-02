// src/lib/state/settingsStore.ts

import { writable, get } from 'svelte/store';
import type { SoundIdentifier } from '$lib/audio/Sound';
import { browser } from '$app/environment';

export interface Settings {
	strongBeatSound: SoundIdentifier;
	weakBeatSound: SoundIdentifier;
}

const DEFAULT_SETTINGS: Settings = {
	strongBeatSound: 'WOODBLOCK_HIGH',
	weakBeatSound: 'WOODBLOCK'
};

function getStoredSettings(): Settings | null {
	if (!browser) return null;
	const stored = localStorage.getItem('settings');
	return stored ? JSON.parse(stored) : null;
}

const store = writable<Settings | null>(getStoredSettings());

let isInitialized = false;

export const settingsStore = {
	subscribe: store.subscribe,
	initialize: () => {
		if (!browser || isInitialized) return;

		const currentSettings = get(store);

		if (!currentSettings?.strongBeatSound || !currentSettings?.weakBeatSound) {
			const newSettings = { ...DEFAULT_SETTINGS, ...currentSettings };
			store.set(newSettings);
		}
		isInitialized = true;
	},
	set: store.set
};

if (browser) {
	settingsStore.subscribe((value) => {
		if (value) {
			localStorage.setItem('settings', JSON.stringify(value));
		}
	});
}
