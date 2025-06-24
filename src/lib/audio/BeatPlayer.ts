// src/lib/audio/BeatPlayer.ts

import * as Tone from 'tone';
import { browser } from '$app/environment';

export class BeatPlayer {
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

	public static readonly CAJON_BASS = new BeatPlayer('cajon-bass.mp3');
	public static readonly CAJON_SNARE = new BeatPlayer('cajon-snare.mp3');
	public static readonly CLAP = new BeatPlayer('clap.mp3');
	public static readonly CLAPS = new BeatPlayer('claps.mp3');
	public static readonly SHAKER = new BeatPlayer('shaker.mp3');
	public static readonly SLEIGH_BELLS = new BeatPlayer('sleigh-bells.mp3');
	public static readonly STOMP = new BeatPlayer('stomp.mp3');
	public static readonly WOODBLOCK = new BeatPlayer('woodblock.mp3');
	public static readonly WOODBLOCK_HIGH = new BeatPlayer('woodblock-high.mp3');

	public static readonly ALL_SOUNDS: BeatPlayer[] = [
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
	private static readonly soundsToPreload = new Set<BeatPlayer>();

	public static registerForPreload(player: BeatPlayer): void {
		if (browser) {
			this.soundsToPreload.add(player);
		}
	}

	public playBeat(): void {
		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}
		this.player?.start();
	}

	public dispose(): void {
		this.player?.dispose();
	}

	public static async preloadRegisteredSounds(): Promise<void> {
		if (browser && this.soundsToPreload.size > 0) {
			console.log(`Preloading ${this.soundsToPreload.size} registered sounds...`);

			const preloadPromises = Array.from(this.soundsToPreload).map((player) => player.ready);

			await Promise.all(preloadPromises);
			console.log('Registered sounds preloaded.');
		}
	}

	public static disposeAll(): void {
		if (browser) {
			BeatPlayer.ALL_SOUNDS.forEach((sound) => sound.dispose());
			console.log('All static BeatPlayers disposed.');
		}
	}
}
