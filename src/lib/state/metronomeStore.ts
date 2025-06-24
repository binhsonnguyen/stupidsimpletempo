// src/lib/state/metronomeStore.ts
import { type Subscriber, writable } from 'svelte/store';
import type { ISetTempoUseCase } from '$lib/core/ports/ISetTempoUseCase';
import type { IToggleUseCase } from '$lib/core/ports/IToggleUseCase';

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
	subscribe: Subscriber<MetronomeState>;
	setTempo: ISetTempoUseCase;
	toggle: IToggleUseCase;
}

function createMetronomeStore() {
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

export const metronomeStore = createMetronomeStore();