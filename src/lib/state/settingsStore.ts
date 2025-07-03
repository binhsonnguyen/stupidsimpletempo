// src/lib/state/settingsStore.ts

import { writable, get } from 'svelte/store';
import type { SoundIdentifier } from '$lib/audio/Sound';
import { browser } from '$app/environment';
import { VALID_DIVISIONS, type Division, VALID_BEAT_INTERVALS, type BeatInterval } from '$lib/constants';

export interface Settings {
	strongBeatSound: SoundIdentifier;
	weakBeatSound: SoundIdentifier;
	volume: number;
	enabledDivisions: Division[];
	enabledBeatIntervals: BeatInterval[];
}

export const MAX_VOLUME = 120;

const DEFAULT_SETTINGS: Settings = {
	strongBeatSound: 'WOODBLOCK_HIGH',
	weakBeatSound: 'WOODBLOCK',
	volume: 100,
	enabledDivisions: [...VALID_DIVISIONS],
	enabledBeatIntervals: [...VALID_BEAT_INTERVALS]
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
		setEnabledBeatIntervals: (newIntervals: BeatInterval[]) => {
			update((currentSettings) => ({ ...currentSettings, enabledBeatIntervals: newIntervals }));
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
