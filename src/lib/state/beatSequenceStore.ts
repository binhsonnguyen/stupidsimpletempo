// src/lib/state/beatSequenceStore.ts

import { writable, type Writable } from 'svelte/store';
import { Sound } from '$lib/audio/Sound';

export type BeatNode = {
	sound: Sound;
	durationInBeats: number; // Ví dụ: 1 cho nốt đen, 0.5 cho nốt móc đơn
	next: BeatNode | null;
};

export type BeatSequenceState = {
	head: BeatNode | null;
	nextBeat: BeatNode | null;
};
