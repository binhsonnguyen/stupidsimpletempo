// src/lib/state/volumeStore.ts

import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import * as Tone from 'tone';
import { settingsStore, type Settings, MAX_VOLUME } from './settingsStore';

/**
 * Chuyển đổi giá trị âm lượng tuyến tính (0-150) sang decibel (dB).
 * Các giá trị trên 100 sẽ được chuyển thành dB dương (khuếch đại).
 * @param linearVolume - Giá trị từ 0 đến MAX_VOLUME.
 * @returns Giá trị tương ứng bằng decibel.
 */
function linearToDecibel(linearVolume: number): number {
	if (linearVolume <= 0) {
		return -Infinity; // Hoàn toàn im lặng
	}
	const gain = linearVolume / 100;
	return 20 * Math.log10(gain);
}

export type VolumeState = {
	isMuted: boolean;
	minVolume: number;
	maxVolume: number;
	lastVolumeBeforeMute: number;
};

const store = writable<VolumeState>({
	isMuted: false,
	minVolume: 0,
	maxVolume: MAX_VOLUME,
	lastVolumeBeforeMute: 100
});

if (browser) {
	let currentSettings: Settings | null = get(settingsStore);
	let currentVolumeState: VolumeState = get(store);

	const updateToneVolume = () => {
		if (!currentSettings) return;

		if (currentVolumeState.isMuted) {
			Tone.getDestination().volume.value = -Infinity;
		} else {
			Tone.getDestination().volume.value = linearToDecibel(currentSettings.volume);
		}
	};

	settingsStore.subscribe((settings) => {
		currentSettings = settings;
		if (settings) {
			store.update((state) => ({ ...state, lastVolumeBeforeMute: settings.volume }));
		}
		updateToneVolume();
	});

	store.subscribe((volumeState) => {
		currentVolumeState = volumeState;
		updateToneVolume();
	});
}

const setVolume = (newVolume: number) => {
	const currentSettings = get(settingsStore);
	if (!currentSettings) return;

	const clampedVolume = Math.max(get(store).minVolume, Math.min(newVolume, get(store).maxVolume));

	settingsStore.set({ ...currentSettings, volume: clampedVolume });

	store.update((state) => ({ ...state, isMuted: false }));
};

const toggleMute = () => {
	store.update((state) => {
		const newMutedState = !state.isMuted;
		if (!newMutedState) {
			const currentSettings = get(settingsStore);
			if (currentSettings) {
				setVolume(state.lastVolumeBeforeMute || currentSettings.volume);
			}
		}
		return { ...state, isMuted: newMutedState };
	});
};

export const volumeStore = {
	subscribe: store.subscribe,
	setVolume,
	toggleMute
};
