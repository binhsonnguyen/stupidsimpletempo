// src/lib/state/settingsStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { type SoundIdentifier } from '$lib/audio/Sound';

export type AppSettings = {
	strongBeatSound: SoundIdentifier;
	weakBeatSound: SoundIdentifier;
};

const defaultSettings: AppSettings = {
	strongBeatSound: 'WOODBLOCK_HIGH',
	weakBeatSound: 'WOODBLOCK'
};

const initialSettings = (): AppSettings => {
	if (!browser) {
		return defaultSettings;
	}

	try {
		const savedSettingsJSON = localStorage.getItem('appSettings');
		if (savedSettingsJSON) {
			const savedSettings = JSON.parse(savedSettingsJSON) as AppSettings;
			if (savedSettings.strongBeatSound && savedSettings.weakBeatSound) {
				return savedSettings;
			}
		}
	} catch (error) {
		console.error('Failed to parse settings from localStorage:', error);
		localStorage.removeItem('appSettings');
	}

	return defaultSettings;
};

const store = writable<AppSettings>(initialSettings());

store.subscribe((value) => {
	if (browser) {
		localStorage.setItem('appSettings', JSON.stringify(value));
	}
});

export const settingsStore = {
	subscribe: store.subscribe,
	setStrongBeatSound: (sound: SoundIdentifier) => {
		store.update((settings) => ({ ...settings, strongBeatSound: sound }));
	},
	setWeakBeatSound: (sound: SoundIdentifier) => {
		store.update((settings) => ({ ...settings, weakBeatSound: sound }));
	}
};