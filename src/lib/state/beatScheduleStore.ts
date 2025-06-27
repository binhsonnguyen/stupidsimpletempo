// src/lib/state/beatScheduleStore.ts

import { writable, get, type Writable } from 'svelte/store';
import { MAX_BEATS } from './beatSequenceStore';
import { logger } from '$lib/services/logger';

export type BeatAppointment = number | null;

export type BeatSchedule = {
	current: BeatAppointment;
	previous: BeatAppointment;
};

export type BeatScheduleState = BeatSchedule[];

const initialState: BeatScheduleState = Array(MAX_BEATS).fill(null).map(() => ({
	current: null,
	previous: null
}));

export type BeatScheduleStore = {
	subscribe: Writable<BeatScheduleState>['subscribe'];
	setBeatAppointment: (beatIndex: number, newAppointment: number) => void;
	getBeatSchedule: (beatIndex: number) => BeatSchedule | undefined;
	reset: () => void;
};

function createBeatScheduleStore(): BeatScheduleStore {
	const { subscribe, update, set } = writable<BeatScheduleState>(initialState);

	const setBeatAppointment = (beatIndex: number, newAppointment: number) => {
		if (beatIndex < 0 || beatIndex >= MAX_BEATS) {
			logger.warn(`Invalid beat index: ${beatIndex}. Must be between 0 and ${MAX_BEATS - 1}.`);
			return;
		}

		update((state) => {
			const newState = [...state];
			const currentSchedule = newState[beatIndex];

			newState[beatIndex] = {
				current: newAppointment,
				previous: currentSchedule ? currentSchedule.current : null
			};
			return newState;
		});
	};

	const getBeatSchedule = (beatIndex: number): BeatSchedule | undefined => {
		const state = get(beatScheduleStore);
		if (beatIndex >= 0 && beatIndex < state.length) {
			return state[beatIndex];
		}
		logger.warn(`Attempted to get schedule for invalid beat index: ${beatIndex}`);
		return undefined;
	};

	const reset = () => {
		set(initialState);
	};

	return {
		subscribe,
		setBeatAppointment,
		getBeatSchedule,
		reset
	};
}

export const beatScheduleStore: BeatScheduleStore = createBeatScheduleStore();