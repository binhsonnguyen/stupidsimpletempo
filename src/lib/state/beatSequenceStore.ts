// src/lib/state/beatSequenceStore.ts

import { writable, type Writable } from 'svelte/store';
import { Sound } from '$lib/audio/Sound';

export type BeatNode = {
	sound: Sound;
	durationInBeats: number; // Ví dụ: 1 cho nốt đen, 0.5 cho nốt móc đơn
	next: BeatNode | null;
};

export type BeatSequenceState = {
	head: BeatNode | null;
	nextBeat: BeatNode | null;
};


const simpleBeat: BeatNode = {
	sound: Sound.WOODBLOCK,
	durationInBeats: 1,
	next: null
};

simpleBeat.next = simpleBeat

const initialState: BeatSequenceState = {
	head: simpleBeat,
	nextBeat: simpleBeat,
};

export type BeatSequenceStore = {
	subscribe: Writable<BeatSequenceState>['subscribe'];
	advance: () => void;
	reset: () => void;
	setSequence: (newHead: BeatNode) => void;
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, update } = writable<BeatSequenceState>(initialState);

	return {
		subscribe,

		// qua beat tiếp
		advance: () => {
			update((state) => {
				if (!state.nextBeat) return state;
				const next = state.nextBeat.next ?? state.head;
				return { ...state, nextBeat: next };
			});
		},

		// về head
		reset: () => {
			update((state) => ({ ...state, nextBeat: state.head }));
		},

		// đổi chuỗi
		setSequence: (newHead: BeatNode) => {
			update(() => ({
				head: newHead,
				nextBeat: newHead
			}));
		}
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();