// src/lib/state/beatSequenceStore.ts

import { writable, type Writable } from 'svelte/store';
import { Sound } from '$lib/audio/Sound';
import { isAudioLoading } from './audioLoadingStore';

export type BeatNode = {
	sound: Sound;
	durationInBeats: number;
	next: BeatNode | null;
};

export type BeatSequenceState = {
	head: BeatNode | null;
	nextBeat: BeatNode | null;
};

const initialState: BeatSequenceState = {
	head: null,
	nextBeat: null
};

export type BeatSequenceStore = {
	subscribe: Writable<BeatSequenceState>['subscribe'];
	advance: () => void;
	reset: () => void;
	setSequence: (beatsPerMeasure: number) => Promise<void>;
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, update } = writable<BeatSequenceState>(initialState);

	const setSequence = async (beatsPerMeasure: number) => {
		isAudioLoading.set(true);

		const accentSound = Sound.WOODBLOCK_HIGH;
		const tickSound = Sound.WOODBLOCK;

		Sound.registerForPreload(accentSound);
		Sound.registerForPreload(tickSound);

		await Sound.preloadRegisteredSounds();

		if (beatsPerMeasure <= 0) {
			update(() => ({ head: null, nextBeat: null }));
			isAudioLoading.set(false);
			return;
		}

		const head: BeatNode = { sound: accentSound, durationInBeats: 1, next: null };
		let currentNode = head;

		for (let i = 1; i < beatsPerMeasure; i++) {
			const nextNode: BeatNode = { sound: tickSound, durationInBeats: 1, next: null };
			currentNode.next = nextNode;
			currentNode = nextNode;
		}

		currentNode.next = head;

		update(() => ({
			head: head,
			nextBeat: head
		}));

		isAudioLoading.set(false);
	};

	return {
		subscribe,
		advance: () => {
			update((state) => {
				if (!state.nextBeat) return state;
				const next = state.nextBeat.next ?? state.head;
				return { ...state, nextBeat: next };
			});
		},
		reset: () => {
			update((state) => ({ ...state, nextBeat: state.head }));
		},
		setSequence
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();