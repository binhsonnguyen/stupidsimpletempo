// src/lib/state/beatSequenceStore.ts

import { writable, type Writable } from 'svelte/store';
import { Sound } from '$lib/audio/Sound';
import { isAudioLoading } from './audioLoadingStore';

export const MAX_BEATS = 8;

export type BeatNode = {
	sound: Sound;
	index: number;
};

export type BeatSequenceState = {
	allBeats: BeatNode[];
};

const initialState: BeatSequenceState = {
	allBeats: []
};

export type BeatSequenceStore = {
	subscribe: Writable<BeatSequenceState>['subscribe'];
	initialize: () => Promise<void>;
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, set } = writable<BeatSequenceState>(initialState);

	const initializeAllBeats = async () => {
		isAudioLoading.set(true);

		const accentSound = Sound.WOODBLOCK_HIGH;
		const tickSound = Sound.WOODBLOCK;

		Sound.registerForPreload(accentSound);
		Sound.registerForPreload(tickSound);
		await Sound.preloadRegisteredSounds();

		const beats: BeatNode[] = [];
		for (let i = 0; i < MAX_BEATS; i++) {
			const sound = (i === 0) ? accentSound : tickSound;
			beats.push({ sound, index: i });
		}

		set({ allBeats: beats });
		isAudioLoading.set(false);
	};

	return {
		subscribe,
		initialize: initializeAllBeats
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();