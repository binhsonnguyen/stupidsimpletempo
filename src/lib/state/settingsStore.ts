// src/lib/state/settingsStore.ts

import { writable, get } from 'svelte/store';
import type { SoundIdentifier } from '$lib/audio/Sound';
import { browser } from '$app/environment';
import { VALID_DIVISIONS, type Division } from '$lib/constants';

export interface Settings {
	strongBeatSound: SoundIdentifier;
	weakBeatSound: SoundIdentifier;
	volume: number;
	enabledDivisions: Division[];
}

export const MAX_VOLUME = 120;

const DEFAULT_SETTINGS: Settings = {
	strongBeatSound: 'WOODBLOCK_HIGH',
	weakBeatSound: 'WOODBLOCK',
	volume: 100,
	enabledDivisions: [...VALID_DIVISIONS]
};

function createSettingsStore() {
	const initialSettings = (() => {
		if (!browser) return DEFAULT_SETTINGS;
		const stored = localStorage.getItem('settings');
		const storedSettings = stored ? JSON.parse(stored) : {};
		return { ...DEFAULT_SETTINGS, ...storedSettings };
	})();

	const { subscribe, set, update } = writable<Settings>(initialSettings);

	if (browser) {
		subscribe((value) => {
			if (value) {
				localStorage.setItem('settings', JSON.stringify(value));
			}
		});
	}

	return {
		subscribe,
		updateSetting: (newPartialSettings: Partial<Settings>) => {
			update((currentSettings) => ({ ...currentSettings, ...newPartialSettings }));
		},
		setEnabledDivisions: (newDivisions: Division[]) => {
			const sortedDivisions = [...newDivisions].sort((a, b) => a - b);
			update((currentSettings) => ({ ...currentSettings, enabledDivisions: sortedDivisions }));
		},
		set: (newSettings: Settings) => {
			set(newSettings);
		},
		reset: () => {
			set(DEFAULT_SETTINGS);
		}
	};
}

export const settingsStore = createSettingsStore();
