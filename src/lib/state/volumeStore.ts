// src/lib/state/volumeStore.ts

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import * as Tone from 'tone';

/**
 * Chuyển đổi giá trị âm lượng tuyến tính (0-100) sang decibel (dB).
 * Điều này làm cho thanh trượt âm lượng cho cảm giác tự nhiên hơn.
 * @param linearVolume - Giá trị từ 0 đến 100.
 * @returns Giá trị tương ứng bằng decibel.
 */
function linearToDecibel(linearVolume: number): number {
	if (linearVolume <= 0) {
		return -Infinity; // Hoàn toàn im lặng
	}
	// Công thức chuyển đổi từ gain (0-1) sang dB
	return 20 * Math.log10(linearVolume / 100);
}

export type VolumeState = {
	volume: number;
	isMuted: boolean;
	minVolume: number;
	maxVolume: number;
	lastVolumeBeforeMute: number;
};

const initialState: VolumeState = {
	volume: 100,
	isMuted: false,
	minVolume: 0,
	maxVolume: 100,
	lastVolumeBeforeMute: 100
};

export type VolumeStore = {
	subscribe: Writable<VolumeState>['subscribe'];
	setVolume: (newVolume: number) => void;
	toggleMute: () => void;
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
				Tone.getDestination().volume.value = linearToDecibel(state.volume);
			}
		});
	}

	return {
		subscribe,

		setVolume: (newVolume: number) => {
			update((state) => {
				// Khi người dùng đổi volume, tự động bỏ tắt tiếng.
				return { ...state, volume: newVolume, isMuted: false };
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
		}
	};
}

export const volumeStore: VolumeStore = createVolumeStore();
