// src/lib/state/metronomeStore.ts
import { writable, type Writable, get } from 'svelte/store';
import * as Tone from 'tone';
import { browser } from '$app/environment';
import { beatSequenceStore } from './beatSequenceStore';

export const VALID_BEAT_INTERVALS = ['1m', '2n', '4n', '8n', '16n', '8t'] as const;

export type BeatInterval = (typeof VALID_BEAT_INTERVALS)[number];

export type MetronomeState = {
	bpm: number;
	isRunning: boolean;
	minBpm: number;
	maxBpm: number;
	beatsPerMeasure: number;
	beatInterval: BeatInterval;
};

const initialState: MetronomeState = {
	bpm: 40,
	isRunning: false,
	minBpm: 40,
	maxBpm: 200,
	beatsPerMeasure: 1,
	beatInterval: '4n'
};

export type MetronomeStore = {
	subscribe: Writable<MetronomeState>['subscribe'];
	setTempo: (newBpm: number) => void;
	setBeatsPerMeasure: (count: number) => void;
	setBeatInterval: (interval: BeatInterval) => void;
	toggle: () => void;
	reset: () => void;
};

function createMetronomeStore(): MetronomeStore {
	const { subscribe, update, set } = writable<MetronomeState>(initialState);
	let scheduledEventId: number | null = null;

	if (browser) {
		subscribe((state) => {
			Tone.getTransport().bpm.value = state.bpm;
		});
	}

	const loop = (time: number) => {
		const sequenceState = get(beatSequenceStore);
		const currentBeat = sequenceState.nextBeat;

		if (currentBeat) {
			currentBeat.sound.play(time);
			beatSequenceStore.advance();
		}
	};

	const startLoop = () => {
		const currentInterval = get(metronomeStore).beatInterval;
		scheduledEventId = Tone.getTransport().scheduleRepeat(loop, currentInterval);
		Tone.getTransport().start();
	};

	const stopLoop = () => {
		Tone.getTransport().stop();
		if (scheduledEventId !== null) {
			Tone.getTransport().clear(scheduledEventId);
			scheduledEventId = null;
		}
		beatSequenceStore.reset();
	};

	const toggle = () => {
		if (!browser) return;

		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}

		const isRunning = get(metronomeStore).isRunning;

		if (isRunning) {
			stopLoop();
		} else {
			startLoop();
		}

		update((state) => ({ ...state, isRunning: !state.isRunning }));
	};

	const setBeatInterval = (interval: BeatInterval) => {
		const isRunning = get(metronomeStore).isRunning;
		if (isRunning) {
			stopLoop();
		}

		update((state) => ({ ...state, beatInterval: interval }));

		if (isRunning) {
			startLoop();
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
		setBeatsPerMeasure: (count: number) => {
			update((state) => ({ ...state, beatsPerMeasure: count }));
		},
		setBeatInterval,
		toggle,
		reset
	};
}

export const metronomeStore: MetronomeStore = createMetronomeStore();