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
			// Lên lịch cho hàm loop chạy lặp lại sau mỗi nốt đen ('4n')
			// Tone.js sẽ tự động tính toán thời gian dựa trên BPM
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