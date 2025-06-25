// src/lib/state/metronomeStore.ts
import { writable, type Writable, get } from 'svelte/store';
import * as Tone from 'tone';
import { browser } from '$app/environment';
import { beatSequenceStore } from './beatSequenceStore';

export type MetronomeState = {
	bpm: number;
	isRunning: boolean;
	minBpm: number;
	maxBpm: number;
	beatsPerMeasure: number;
};

const initialState: MetronomeState = {
	bpm: 40,
	isRunning: false,
	minBpm: 40,
	maxBpm: 200,
	beatsPerMeasure: 1
};

export type MetronomeStore = {
	subscribe: Writable<MetronomeState>['subscribe'];
	setTempo: (newBpm: number) => void;
	setBeatsPerMeasure: (count: number) => void;
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

	const toggle = () => {
		if (!browser) return;

		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}

		const isRunning = get(metronomeStore).isRunning;

		if (isRunning) {
			Tone.getTransport().stop();
			if (scheduledEventId !== null) {
				Tone.getTransport().clear(scheduledEventId);
				scheduledEventId = null;
			}
			beatSequenceStore.reset();
		} else {
			scheduledEventId = Tone.getTransport().scheduleRepeat(loop, '4n');
			Tone.getTransport().start();
		}

		update((state) => ({ ...state, isRunning: !state.isRunning }));
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

		toggle,

		reset: () => {
			if (browser) {
				Tone.getTransport().stop();
				if (scheduledEventId !== null) {
					Tone.getTransport().clear(scheduledEventId);
					scheduledEventId = null;
				}
			}
			beatSequenceStore.reset();
			set(initialState);
		}
	};
}

export const metronomeStore: MetronomeStore = createMetronomeStore();