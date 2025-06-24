// src/lib/audio/BeatPlayer.ts

import * as Tone from 'tone';
import { browser } from '$app/environment';

export class BeatPlayer {
	private player: Tone.Player | null = null;
	private ready: Promise<void>;

	private constructor(soundUrl: string) {
		if (browser) {
			this.player = new Tone.Player(soundUrl).toDestination();
			this.ready = this.player.load(soundUrl).then(() => {});
		} else {
			this.ready = Promise.resolve();
		}
	}

	public static readonly CAJON_BASS = new BeatPlayer('/sound/cajon-bass.mp3');
	public static readonly CAJON_SNARE = new BeatPlayer('/sound/cajon-snare.mp3');
	public static readonly CLAP = new BeatPlayer('/sound/clap.mp3');
	public static readonly CLAPS = new BeatPlayer('/sound/claps.mp3');
	public static readonly SHAKER = new BeatPlayer('/sound/shaker.mp3');
	public static readonly SLEIGH_BELLS = new BeatPlayer('/sound/sleigh-bells.mp3');
	public static readonly STOMP = new BeatPlayer('/sound/stomp.mp3');
	public static readonly WOODBLOCK = new BeatPlayer('/sound/woodblock.mp3');
	public static readonly WOODBLOCK_HIGH = new BeatPlayer('/sound/woodblock-high.mp3');

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

	public playBeat(): void {
		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}
		this.player?.start();
	}

	public dispose(): void {
		this.player?.dispose();
	}

	public static async preloadAll(): Promise<void> {
		if (browser) {
			console.log('Preloading all sounds...');
			await Promise.all(BeatPlayer.ALL_SOUNDS);
			console.log('All sounds preloaded.');
		}
	}

	public static disposeAll(): void {
		if (browser) {
			BeatPlayer.ALL_SOUNDS.forEach(sound => sound.dispose());
			console.log('All static BeatPlayers disposed.');
		}
	}
}
