// src/lib/audio/Sound.ts

import * as Tone from 'tone';
import { browser } from '$app/environment';
import { logger } from '$lib/services/logger';

type AudioExtension = 'webm' | 'mp3' | 'wav';

/**
 * Determines the best supported audio format by the browser and caches the result.
 * The preference order is opus > mp3 > wav.
 * This is an IIFE (Immediately Invoked Function Expression) that runs once
 * when the module is first imported.
 */
const bestAudioFormat: AudioExtension = (() => {
	// During Server-Side Rendering, there's no browser. Default to 'wav'.
	// This value is mainly a placeholder as audio won't be loaded on the server.
	if (!browser) {
		return 'wav';
	}

	const audio = document.createElement('audio');

	// Check for Opus support first (most modern and efficient).
	if (audio.canPlayType('audio/webm; codecs="opus"').replace(/no/, '')) {
		return 'webm';
	}
	// Then check for MP3 (widely supported, especially by Safari).
	if (audio.canPlayType('audio/mpeg').replace(/no/, '')) {
		return 'mp3';
	}
	// Fallback to WAV (universally supported but larger files).
	return 'wav';
})();

export type SoundIdentifier =
	| 'CAJON_BASS'
	| 'CAJON_SNARE'
	| 'CLAP'
	| 'CLAPS'
	| 'SHAKER'
	| 'SLEIGH_BELLS'
	| 'STOMP'
	| 'WOODBLOCK'
	| 'WOODBLOCK_HIGH';

export class Sound {
	private player: Tone.Player | null = null;
	private readonly ready: Promise<void>;

	public readonly identifier: SoundIdentifier;

	private constructor(baseFilename: string, identifier: SoundIdentifier) {
		this.identifier = identifier;
		if (browser) {
			const soundUrl = `/sound/${baseFilename}.${bestAudioFormat}`;

			this.player = new Tone.Player(soundUrl).toDestination();
			this.ready = this.player.load(soundUrl).then(() => {});
		} else {
			this.ready = Promise.resolve();
		}
	}

	public static readonly CAJON_BASS = new Sound('cajon-bass', 'CAJON_BASS');
	public static readonly CAJON_SNARE = new Sound('cajon-snare', 'CAJON_SNARE');
	public static readonly CLAP = new Sound('clap', 'CLAP');
	public static readonly CLAPS = new Sound('claps', 'CLAPS');
	public static readonly SHAKER = new Sound('shaker', 'SHAKER');
	public static readonly SLEIGH_BELLS = new Sound('sleigh-bells', 'SLEIGH_BELLS');
	public static readonly STOMP = new Sound('stomp', 'STOMP');
	public static readonly WOODBLOCK = new Sound('woodblock', 'WOODBLOCK');
	public static readonly WOODBLOCK_HIGH = new Sound('woodblock-high', 'WOODBLOCK_HIGH');

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

	public static readonly soundMap = new Map<SoundIdentifier, Sound>(
		Sound.ALL_SOUNDS.map((sound) => [sound.identifier, sound])
	);

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
			this.soundsToPreload.clear();
		}
	}

	public static disposeAll(): void {
		if (browser) {
			Sound.ALL_SOUNDS.forEach((sound) => sound.dispose());
			logger.log('All static Sounds disposed.');
		}
	}
}
