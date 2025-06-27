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

	const initialize = async () => {
		const generateBeatsWithAccentFirst = (count: number): BeatNode[] => {
			const beats: BeatNode[] = [];
			for (let i = 0; i < count; i++) {
				const sound = i === 0 ? Sound.WOODBLOCK_HIGH : Sound.WOODBLOCK;
				beats.push({ sound, index: i });
			}
			return beats;
		};

		const registerForPreloadSounds = (beats: BeatNode[]) => {
			const uniqueSounds = [...new Set(beats.map((beat) => beat.sound))];
			uniqueSounds.forEach((sound) => Sound.registerForPreload(sound));
		};

		isAudioLoading.set(true);

		const beats = generateBeatsWithAccentFirst(MAX_BEATS);
		registerForPreloadSounds(beats);
		await Sound.preloadRegisteredSounds();

		set({ allBeats: beats });
		isAudioLoading.set(false);
	};

	return {
		subscribe,
		initialize: initialize
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();
