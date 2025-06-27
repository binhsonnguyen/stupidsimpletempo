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

		const beats: BeatNode[] = [];
		for (let i = 0; i < MAX_BEATS; i++) {
			const sound = i === 0 ? Sound.WOODBLOCK_HIGH : Sound.WOODBLOCK;
			beats.push({ sound, index: i });
		}

		beats.map(beat => beat.sound)
			.forEach(sound => Sound.registerForPreload(sound));
		await Sound.preloadRegisteredSounds();

		set({ allBeats: beats });
		isAudioLoading.set(false);
	};

	return {
		subscribe,
		initialize: initializeAllBeats
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();
