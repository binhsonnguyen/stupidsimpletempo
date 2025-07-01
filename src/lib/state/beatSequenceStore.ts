// src/lib/state/beatSequenceStore.ts

import { writable, type Writable, get } from 'svelte/store';
import { Sound } from '$lib/audio/Sound';
import { isAudioLoading } from './audioLoadingStore';
import { MAX_BEATS } from '$lib/constants';
import { settingsStore, type AppSettings } from './settingsStore';

export interface IPlayable {
	play(time: number): void;
}

class AccentPlayer implements IPlayable {
	constructor(private sound: Sound) {}

	play(time: number): void {
		this.sound.play(time);
	}
}

class NormalBeatPlayer implements IPlayable {
	constructor(private sound: Sound) {}

	play(time: number): void {
		this.sound.play(time);
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
	initialize: () => Promise<void>;
};

function createBeatSequenceStore(): BeatSequenceStore {
	const { subscribe, set } = writable<BeatSequenceState>(initialState);
	let isInitialized = false;

	const generateBeats = async (settings: AppSettings) => {
		isAudioLoading.set(true);

		const strongSound = Sound.soundMap.get(settings.strongBeatSound) || Sound.WOODBLOCK_HIGH;
		const weakSound = Sound.soundMap.get(settings.weakBeatSound) || Sound.WOODBLOCK;

		const beats: BeatNode[] = [];
		for (let i = 0; i < MAX_BEATS; i++) {
			const player = i === 0 ? new AccentPlayer(strongSound) : new NormalBeatPlayer(weakSound);
			beats.push({ player: player, index: i });
		}

		Sound.registerForPreload(strongSound);
		Sound.registerForPreload(weakSound);
		await Sound.preloadRegisteredSounds();

		set({ allBeats: beats });
		isAudioLoading.set(false);
	};

	const initialize = async () => {
		if (isInitialized) return;
		const initialSettings = get(settingsStore);
		await generateBeats(initialSettings);
		isInitialized = true;
	};

	settingsStore.subscribe(async (settings) => {
		if (isInitialized) {
			await generateBeats(settings);
		}
	});

	return {
		subscribe,
		initialize
	};
}

export const beatSequenceStore: BeatSequenceStore = createBeatSequenceStore();
