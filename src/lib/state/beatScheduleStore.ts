// src/lib/state/beatScheduleStore.ts

import { writable, get, type Writable } from 'svelte/store';
import { MAX_BEATS } from './beatSequenceStore';
import { logger } from '$lib/services/logger';

type TimeStamp = number;
export type BeatAppointment = TimeStamp | null;

const calculateProximity = (
	previous: BeatAppointment | null,
	current: BeatAppointment | null,
	pointOfTime: TimeStamp
): number => {
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

export type BeatProximity = number;

export type BeatSchedule = {
	current: BeatAppointment;
	previous: BeatAppointment;
	proximityToNextBeat?: BeatProximity;
};

export type BeatScheduleState = {
	individualBeatSchedules: { current: BeatAppointment; previous: BeatAppointment }[];
	masterAppointments: { current: BeatAppointment; previous: BeatAppointment };
};

const initialState: BeatScheduleState = {
	individualBeatSchedules: Array(MAX_BEATS)
		.fill(null)
		.map(() => ({
			current: null,
			previous: null
		})),
	masterAppointments: {
		current: null,
		previous: null
	}
};

export type BeatScheduleStore = {
	subscribe: Writable<BeatScheduleState>['subscribe'];
	setMasterAppointment: (newAppointment: TimeStamp) => void;
	getMasterSchedule: (pointOfTime: TimeStamp) => BeatSchedule;
	setBeatAppointment: (beatIndex: number, newAppointment: TimeStamp) => void;
	getBeatSchedule: (beatIndex: number, pointOfTime: TimeStamp) => BeatSchedule | undefined;
	reset: () => void;
};

function createBeatScheduleStore(): BeatScheduleStore {
	const { subscribe, update, set } = writable<BeatScheduleState>(initialState);

	const setBeatAppointment = (beatIndex: number, newAppointment: TimeStamp) => {
		if (beatIndex < 0 || beatIndex >= MAX_BEATS) {
			logger.warn(`Invalid beat index: ${beatIndex}. Must be between 0 and ${MAX_BEATS - 1}.`);
			return;
		}

		update((state) => {
			const newIndividualBeatSchedules = [...state.individualBeatSchedules];
			const currentSchedule = newIndividualBeatSchedules[beatIndex];

			newIndividualBeatSchedules[beatIndex] = {
				current: newAppointment,
				previous: currentSchedule ? currentSchedule.current : null
			};

			const newMasterAppointments = {
				current: newAppointment,
				previous: state.masterAppointments.current // Lấy current cũ của master
			};

			return {
				individualBeatSchedules: newIndividualBeatSchedules,
				masterAppointments: newMasterAppointments
			};
		});
	};

	const setMasterAppointment = (newAppointment: TimeStamp) => {
		update((state) => {
			const newMasterAppointments = {
				current: newAppointment,
				previous: state.masterAppointments.current
			};
			return {
				...state,
				masterAppointments: newMasterAppointments
			};
		});
	};

	const getBeatSchedule = (beatIndex: number, pointOfTime: TimeStamp): BeatSchedule | undefined => {
		const state = get(beatScheduleStore);
		if (beatIndex >= 0 && beatIndex < state.individualBeatSchedules.length) {
			const storedSchedule = state.individualBeatSchedules[beatIndex];
			const proximity = calculateProximity(
				storedSchedule.previous,
				storedSchedule.current,
				pointOfTime
			);

			return {
				...storedSchedule,
				proximityToNextBeat: proximity
			};
		}
		logger.warn(`Attempted to get schedule for invalid beat index: ${beatIndex}`);
		return undefined;
	};

	const getMasterSchedule = (pointOfTime: TimeStamp): BeatSchedule => {
		const state = get(beatScheduleStore);
		const { current, previous } = state.masterAppointments;

		const proximity = calculateProximity(previous, current, pointOfTime);

		return {
			current: current,
			previous: previous,
			proximityToNextBeat: proximity
		};
	};

	const reset = () => {
		set(initialState);
	};

	return {
		subscribe,
		setMasterAppointment,
		getMasterSchedule,
		setBeatAppointment,
		getBeatSchedule,
		reset
	};
}

export const beatScheduleStore: BeatScheduleStore = createBeatScheduleStore();
