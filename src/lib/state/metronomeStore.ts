// src/lib/state/metronomeStore.ts
import { type Writable, writable } from 'svelte/store';

type Subscriber<T> = Writable<T>['subscribe'];

// Định nghĩa cấu trúc state
export type MetronomeState = {
	bpm: number;
	isRunning: boolean;
	minBpm: number;
	maxBpm: number;
};

// Khởi tạo giá trị ban đầu
const initialState: MetronomeState = {
	bpm: 40,
	isRunning: false,
	minBpm: 40,
	maxBpm: 200
};

export type MetronomeStore = {
	subscribe: Subscriber<MetronomeState>;
	setBpm: (newBpm: number) => void;
	toggle: () => void;
	reset: () => void;
};

function createMetronomeStore(): MetronomeStore {
	const { subscribe, update, set } = writable<MetronomeState>(initialState);

	return {
		subscribe,
		setBpm: (newBpm: number) => {
			update((state) => {
				// Đảm bảo BPM luôn nằm trong khoảng min-max
				const clampedBpm = Math.max(state.minBpm, Math.min(newBpm, state.maxBpm));
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