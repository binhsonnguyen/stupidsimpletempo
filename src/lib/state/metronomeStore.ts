// src/lib/state/metronomeStore.ts
import { writable, type Writable } from 'svelte/store';

export type MetronomeState = {
	bpm: number;
	isRunning: boolean;
	minBpm: number;
	maxBpm: number;
};

const initialState: MetronomeState = {
	bpm: 40,
	isRunning: false,
	minBpm: 40,
	maxBpm: 200
};

export type MetronomeStore = {
	subscribe: Writable<MetronomeState>['subscribe'];
	setTempo: (newBpm: number) => void;
	toggle: () => void;
	reset: () => void;
};

function createMetronomeStore(): MetronomeStore {
	const { subscribe, update, set } = writable<MetronomeState>(initialState);

	return {
		subscribe,

		setTempo: (newBpm: number) => {
			const roundedBpm = Math.round(newBpm);

			update((state) => {
				const clampedBpm = Math.max(state.minBpm, Math.min(roundedBpm, state.maxBpm));
				return { ...state, bpm: clampedBpm };
			});
		},

		toggle: () => {
			update((state) => ({ ...state, isRunning: !state.isRunning }));
		},

		reset: () => set(initialState)
	};
}

export const metronomeStore: MetronomeStore = createMetronomeStore();