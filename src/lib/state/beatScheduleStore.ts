// src/lib/state/beatScheduleStore.ts

import { writable, get, type Writable } from 'svelte/store';
import { MAX_BEATS } from './beatSequenceStore';
import { logger } from '$lib/services/logger';

type TimeStamp = number;
export type BeatAppointment = TimeStamp | null;

export type BeatSchedule = {
	current: BeatAppointment;
	previous: BeatAppointment;
	proximityToNextBeat?: number;
};

export type BeatScheduleState = {
	current: BeatAppointment;
	previous: BeatAppointment;
}[];

const initialState: BeatScheduleState = Array(MAX_BEATS).fill(null).map(() => ({
	current: null,
	previous: null
}));

export type BeatScheduleStore = {
	subscribe: Writable<BeatScheduleState>['subscribe'];
	setBeatAppointment: (beatIndex: number, newAppointment: number) => void;
	getBeatSchedule: (beatIndex: number, currentTime: number) => BeatSchedule | undefined;
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

	const calculateProximity = (previous: number | null, current: number | null, moment: number): number => {
		if (current === null) {
			return 0;
		}

		if (previous === null) {
			return moment >= current ? 1 : 0;
		}

		if (moment <= previous) {
			return 0;
		} else if (moment >= current) {
			return 1;
		} else {
			const range = current - previous;
			if (range === 0) {
				return moment >= current ? 1 : 0;
			}
			return (moment - previous) / range;
		}
	};

	const getBeatSchedule = (beatIndex: number, currentTime: number): BeatSchedule | undefined => {
		const state = get(beatScheduleStore); // Lấy trạng thái hiện tại của store
		if (beatIndex >= 0 && beatIndex < state.length) {
			const storedSchedule = state[beatIndex];
			const proximity = calculateProximity(storedSchedule.previous, storedSchedule.current, currentTime);
			return {
				...storedSchedule,
				proximityToNextBeat: proximity
			};
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