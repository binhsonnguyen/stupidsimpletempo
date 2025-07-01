// src/lib/state/beatSoundStore.ts
import { derived } from 'svelte/store';
import { settingsStore } from './settingsStore';
import { Sound } from '$lib/audio/Sound';

export const beatSoundStore = derived(
	settingsStore,
	($settings, set) => {
		const strongSound = Sound.soundMap.get($settings.strongBeatSound) || Sound.WOODBLOCK_HIGH;
		const weakSound = Sound.soundMap.get($settings.weakBeatSound) || Sound.WOODBLOCK;

		Sound.registerForPreload(strongSound);
		Sound.registerForPreload(weakSound);

		Sound.preloadRegisteredSounds().then(() => {
			set({
				strong: strongSound,
				weak: weakSound
			});
		});
	},
	{
		strong: Sound.WOODBLOCK_HIGH,
		weak: Sound.WOODBLOCK
	}
);