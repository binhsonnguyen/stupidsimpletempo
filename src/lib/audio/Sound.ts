// src/lib/audio/Sound.ts

import * as Tone from 'tone';
import { browser } from '$app/environment';
import { logger } from '$lib/services/logger';

export class Sound {
	private player: Tone.Player | null = null;
	private readonly ready: Promise<void>;

	private constructor(filename: string) {
		if (browser) {
			const soundUrl = `/sound/${filename}`;
			this.player = new Tone.Player(soundUrl).toDestination();
			this.ready = this.player.load(soundUrl).then(() => {});
		} else {
			this.ready = Promise.resolve();
		}
	}

	public static readonly CAJON_BASS = new Sound('cajon-bass.mp3');
	public static readonly CAJON_SNARE = new Sound('cajon-snare.mp3');
	public static readonly CLAP = new Sound('clap.mp3');
	public static readonly CLAPS = new Sound('claps.mp3');
	public static readonly SHAKER = new Sound('shaker.mp3');
	public static readonly SLEIGH_BELLS = new Sound('sleigh-bells.mp3');
	public static readonly STOMP = new Sound('stomp.mp3');
	public static readonly WOODBLOCK = new Sound('woodblock.mp3');
	public static readonly WOODBLOCK_HIGH = new Sound('woodblock-high.mp3');

	public static readonly ALL_SOUNDS: Sound[] = [
		this.CAJON_BASS,
		this.CAJON_SNARE,
		this.CLAP,
		this.CLAPS,
		this.SHAKER,
		this.SLEIGH_BELLS,
		this.STOMP,
		this.WOODBLOCK,
		this.WOODBLOCK_HIGH
	];
	private static readonly soundsToPreload = new Set<Sound>();

	public static registerForPreload(sound: Sound): void {
		if (browser) {
			this.soundsToPreload.add(sound);
		}
	}

	public play(time?: number): void {
		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}
		this.player?.start(time);
	}

	public dispose(): void {
		this.player?.dispose();
	}

	public static async preloadRegisteredSounds(): Promise<void> {
		if (browser && this.soundsToPreload.size > 0) {
			logger.log(`Preloading ${this.soundsToPreload.size} registered sounds...`);

			const preloadPromises = Array.from(this.soundsToPreload).map((player) => player.ready);

			await Promise.all(preloadPromises);
			logger.log('Registered sounds preloaded.');
		}
	}

	public static disposeAll(): void {
		if (browser) {
			Sound.ALL_SOUNDS.forEach((sound) => sound.dispose());
			logger.log('All static Sounds disposed.');
		}
	}
}
