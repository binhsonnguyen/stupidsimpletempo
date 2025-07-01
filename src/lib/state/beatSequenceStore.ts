// src/lib/state/beatSequenceStore.ts

import { writable, type Writable, get } from 'svelte/store';
import { beatSoundStore } from './beatSoundStore';
import { MAX_BEATS } from '$lib/constants';

export interface IPlayable {
	play(time: number): void;
}

class AccentPlayer implements IPlayable {
	constructor() {}

	play(time: number): void {
		const sounds = get(beatSoundStore);
		sounds.strong.play(time);
	}
}

class NormalBeatPlayer implements IPlayable {
	constructor() {}

	play(time: number): void {
		const sounds = get(beatSoundStore);
		sounds.weak.play(time);
	}
}

export type BeatNode = {
	player: IPlayable;
	index: number;
};

export type BeatSequenceState = {
	allBeats: BeatNode[];
};

const initialState: BeatSequenceState = {
	allBeats: []
};

export type BeatSequenceStore = {
	subscribe: Writable<BeatSequenceState>['subscribe'];
	initialize: () => void; // Không cần async và không cần settings nữa
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, set } = writable<BeatSequenceState>(initialState);

	const initialize = () => {
		const beats: BeatNode[] = [];
		for (let i = 0; i < MAX_BEATS; i++) {
			const player = i === 0 ? new AccentPlayer() : new NormalBeatPlayer();
			beats.push({ player: player, index: i });
		}
		set({ allBeats: beats });
	};

	return {
		subscribe,
		initialize
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();