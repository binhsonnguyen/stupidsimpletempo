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
	setBeatAppointment: (beatIndex: number, newAppointment: BeatAppointment) => void;
	getBeatSchedule: (beatIndex: number, pointOfTime: TimeStamp) => BeatSchedule | undefined;
	reset: () => void;
};

function createBeatScheduleStore(): BeatScheduleStore {
	const { subscribe, update, set } = writable<BeatScheduleState>(initialState);

	const setBeatAppointment = (beatIndex: number, newAppointment: BeatAppointment) => {
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

	const calculateProximity = (previous: BeatAppointment | null, current: BeatAppointment | null, pointOfTime: TimeStamp): number => {
		if (current === null) {
			return 0;
		}

		if (previous === null) {
			return pointOfTime >= current ? 1 : 0;
		}

		if (pointOfTime <= previous) {
			return 0;
		} else if (pointOfTime >= current) {
			return 1;
		} else {
			const range = current - previous;
			if (range === 0) {
				return pointOfTime >= current ? 1 : 0;
			}
			return (pointOfTime - previous) / range;
		}
	};

	const getBeatSchedule = (beatIndex: number, pointOfTime: TimeStamp): BeatSchedule | undefined => {
		const state = get(beatScheduleStore);
		if (beatIndex >= 0 && beatIndex < state.length) {
			const storedSchedule = state[beatIndex];
			const proximity = calculateProximity(storedSchedule.previous, storedSchedule.current, pointOfTime);
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