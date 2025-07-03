// src/lib/state/settingsStore.ts

import { writable, get } from 'svelte/store';
import type { SoundIdentifier } from '$lib/audio/Sound';
import { browser } from '$app/environment';

export interface Settings {
	strongBeatSound: SoundIdentifier;
	weakBeatSound: SoundIdentifier;
	volume: number;
}

export const MAX_VOLUME = 120;

const DEFAULT_SETTINGS: Settings = {
	strongBeatSound: 'WOODBLOCK_HIGH',
	weakBeatSound: 'WOODBLOCK',
	volume: 100
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
		const newSettings = { ...DEFAULT_SETTINGS, ...currentSettings };

		if (newSettings.volume > MAX_VOLUME) {
			newSettings.volume = MAX_VOLUME;
		}

		store.set(newSettings);

		isInitialized = true;
	},
	set: (newSettings: Settings) => {
		store.set(newSettings);
	}
};

if (browser) {
	settingsStore.subscribe((value) => {
		if (value) {
			localStorage.setItem('settings', JSON.stringify(value));
		}
	});
}