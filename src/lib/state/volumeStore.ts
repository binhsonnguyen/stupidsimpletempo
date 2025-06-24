// src/lib/state/volumeStore.ts

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import * as Tone from 'tone';

/**
 * Chuyển đổi giá trị âm lượng tuyến tính (0-100) sang decibel (dB).
 * Áp dụng một yếu tố khuếch đại (boostFactor) nếu có.
 * @param linearVolume - Giá trị từ 0 đến 100.
 * @param boostFactor - Yếu tố khuếch đại, 1.0 cho không khuếch đại, >1.0 cho khuếch đại.
 * @returns Giá trị tương ứng bằng decibel.
 */
function linearToDecibel(linearVolume: number, boostFactor: number): number {
	if (linearVolume <= 0) {
		return -Infinity; // Hoàn toàn im lặng
	}
	const gain = linearVolume / 100;
	const boostedGain = gain * boostFactor;
	return 20 * Math.log10(boostedGain);
}

export type VolumeState = {
	volume: number;
	isMuted: boolean;
	minVolume: number;
	maxVolume: number;
	lastVolumeBeforeMute: number;
	boostFactor: number;
};

const initialState: VolumeState = {
	volume: 100,
	isMuted: false,
	minVolume: 0,
	maxVolume: 100,
	lastVolumeBeforeMute: 100,
	boostFactor: 1.0
};

export type VolumeStore = {
	subscribe: Writable<VolumeState>['subscribe'];
	setVolume: (newVolume: number) => void;
	toggleMute: () => void;
	setBoostFactor: (factor: number) => void;
};

function createVolumeStore(): VolumeStore {
	const store = writable<VolumeState>(initialState);
	const { subscribe, update } = store;

	// Kết nối store với "van tổng" của Tone.js
	if (browser) {
		subscribe((state) => {
			if (state.isMuted) {
				Tone.getDestination().volume.value = -Infinity;
			} else {
				Tone.getDestination().volume.value = linearToDecibel(state.volume, state.boostFactor);
			}
		});
	}

	return {
		subscribe,

		setVolume: (newVolume: number) => {
			update((state) => {
				const clampedVolume = Math.max(state.minVolume, Math.min(newVolume, state.maxVolume));
				return { ...state, volume: clampedVolume, isMuted: false };
			});
		},

		toggleMute: () => {
			update((state) => {
				if (state.isMuted) {
					return { ...state, isMuted: false };
				} else {
					return {
						...state,
						isMuted: true,
						lastVolumeBeforeMute: state.volume
					};
				}
			});
		},

		setBoostFactor: (factor: number) => {
			update((state) => ({ ...state, boostFactor: factor }));
		}
	};
}

export const volumeStore: VolumeStore = createVolumeStore();
