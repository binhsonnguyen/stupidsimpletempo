// src/lib/state/metronomeStore.ts
import { writable, type Writable, get } from 'svelte/store';
import * as Tone from 'tone';
import { browser } from '$app/environment';
import { beatSequenceStore } from './beatSequenceStore';
import { beatScheduleStore } from './beatScheduleStore';
import { logger } from '$lib/services/logger';
import type { BeatInterval, Division } from '$lib/constants';
import { TimeSignature } from '$lib/models/TimeSignature';

export type MetronomeState = {
	bpm: number;
	isRunning: boolean;
	minBpm: number;
	maxBpm: number;
	timeSignature: TimeSignature;
	currentBeatIndex: number;
};

const initialTimeSignature = new TimeSignature(1, '4n');

const initialState: MetronomeState = {
	bpm: 40,
	isRunning: false,
	minBpm: 40,
	maxBpm: 200,
	timeSignature: initialTimeSignature,
	currentBeatIndex: 0
};

export type MetronomeStore = {
	subscribe: Writable<MetronomeState>['subscribe'];
	setTempo: (newBpm: number) => void;
	setBeatsPerMeasure: (count: Division) => void;
	setBeatInterval: (interval: BeatInterval) => void;
	setTimeSignature: (newTimeSignature: TimeSignature) => void;
	toggle: () => void;
	reset: () => void;
};

function createMetronomeStore(): MetronomeStore {
	const { subscribe, update, set } = writable<MetronomeState>(initialState);
	let scheduledEventId: number | null = null;

	if (browser) {
		let lastKnownBpm = initialState.bpm;
		Tone.getTransport().bpm.value = lastKnownBpm;

		subscribe((state) => {
			if (state.bpm !== lastKnownBpm) {
				Tone.getTransport().bpm.value = state.bpm;
				lastKnownBpm = state.bpm;
			}
		});
	}

	const loop = (time: number) => {
		const metronomeState = get(metronomeStore);
		const allBeats = get(beatSequenceStore).allBeats;

		if (allBeats.length === 0) {
			logger.warn('Beat sequence not initialized or empty. Cannot play beat.');
			return;
		}

		const currentBeat = allBeats[metronomeState.currentBeatIndex];

		if (currentBeat) {
			currentBeat.sound.play(time);

			const { beatsPerMeasure, beatInterval } = metronomeState.timeSignature;
			const nextIndex = (metronomeState.currentBeatIndex + 1) % beatsPerMeasure;
			const intervalSeconds = Tone.Time(beatInterval).toSeconds();
			const nextBeatTime = time + intervalSeconds;

			beatScheduleStore.setBeatAppointment(nextIndex, nextBeatTime);

			update((state) => {
				return { ...state, currentBeatIndex: nextIndex };
			});
		}
	};

	const startLoop = (interval: BeatInterval) => {
		// mồi chu kỳ đầu tiên
		beatScheduleStore.setBeatAppointment(0, Tone.now());
		scheduledEventId = Tone.getTransport().scheduleRepeat(loop, interval);
		Tone.getTransport().start();
	};

	const stopLoop = () => {
		Tone.getTransport().stop();
		if (scheduledEventId !== null) {
			Tone.getTransport().clear(scheduledEventId);
			scheduledEventId = null;
		}
		update((state) => ({ ...state, currentBeatIndex: 0 }));
		beatScheduleStore.reset();
	};

	const toggle = () => {
		if (!browser) return;

		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}

		const currentState = get(metronomeStore);

		if (currentState.isRunning) {
			stopLoop();
		} else {
			startLoop(currentState.timeSignature.beatInterval);
		}

		update((state) => ({ ...state, isRunning: !state.isRunning }));
	};

	const setTimeSignature = (newTimeSignature: TimeSignature) => {
		const wasRunning = get(metronomeStore).isRunning;

		if (wasRunning) {
			stopLoop();
		}

		update((state) => ({ ...state, timeSignature: newTimeSignature, currentBeatIndex: 0 }));

		if (wasRunning) {
			startLoop(newTimeSignature.beatInterval);
		}
	};

	const reset = () => {
		stopLoop();
		set(initialState);
	};

	return {
		subscribe,
		setTempo: (newBpm: number) => {
			const roundedBpm = Math.round(newBpm);
			update((state) => {
				const clampedBpm = Math.max(state.minBpm, Math.min(roundedBpm, state.maxBpm));
				return { ...state, bpm: clampedBpm };
			});
		},
		setBeatsPerMeasure: (count: Division) => {
			const current = get(metronomeStore).timeSignature;
			setTimeSignature(current.withBeats(count));
		},
		setBeatInterval: (interval: BeatInterval) => {
			const current = get(metronomeStore).timeSignature;
			setTimeSignature(current.withInterval(interval));
		},
		setTimeSignature,
		toggle,
		reset
	};
}

export const metronomeStore: MetronomeStore = createMetronomeStore();