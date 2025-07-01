// src/lib/state/beatSoundStore.ts
import { derived } from 'svelte/store';
import { settingsStore } from './settingsStore';
import { Sound } from '$lib/audio/Sound';
import { isAudioLoading } from '$lib/state/audioLoadingStore';
import { logger } from '$lib/services/logger';

export type BeatSoundSet = {
	strong: Sound;
	weak: Sound;
};

let preloadRequestCounter = 0;

export const beatSoundStore = derived<typeof settingsStore, BeatSoundSet>(
	settingsStore,
	($settings, set) => {
		logger.log('BeatSoundStore', $settings);
		isAudioLoading.set(true);

		const currentRequestId = ++preloadRequestCounter;

		const strongSound = Sound.soundMap.get($settings.strongBeatSound) || Sound.WOODBLOCK_HIGH;
		const weakSound = Sound.soundMap.get($settings.weakBeatSound) || Sound.WOODBLOCK;

		Sound.registerForPreload(strongSound);
		Sound.registerForPreload(weakSound);

		const performPreload = async () => {
			logger.log('preload');
			try {
				await Sound.preloadRegisteredSounds();
				set({
					strong: strongSound,
					weak: weakSound
				});
			} catch (error) {
				console.error('Failed to preload sounds:', error);
			} finally {
				if (currentRequestId === preloadRequestCounter) {
					isAudioLoading.set(false);
				}
			}
		};

		performPreload();
	},
	{
		strong: Sound.WOODBLOCK_HIGH,
		weak: Sound.WOODBLOCK
	}
);