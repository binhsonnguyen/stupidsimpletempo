// src/lib/state/beatSequenceStore.ts

import { writable, type Writable, get } from 'svelte/store';
import { beatSoundStore } from './beatSoundStore';
import type { TimeSignature } from '$lib/models/timeSignature';

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
	initialize: (timeSignature: TimeSignature) => void;
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, set } = writable<BeatSequenceState>(initialState);

	const initialize = (timeSignature: TimeSignature) => {
		const beats: BeatNode[] = [];
		const { beatsPerMeasure } = timeSignature;
		const isAccentOff = beatsPerMeasure === 1;

		for (let i = 0; i < beatsPerMeasure; i++) {
			const player = isAccentOff || i !== 0 ? new NormalBeatPlayer() : new AccentPlayer();
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