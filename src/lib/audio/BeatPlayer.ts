// src/lib/audio/BeatPlayer.ts

import * as Tone from 'tone';
import { browser } from '$app/environment';

export class BeatPlayer {
	private player: Tone.Player | null = null;

	private constructor(soundUrl: string) {
		if (browser) {
			this.player = new Tone.Player(soundUrl).toDestination();
		}
	}

	public static readonly WOODBLOCK = new BeatPlayer('/sound/woodblock.mp3');
	public static readonly CLICK = new BeatPlayer('/sound/click.mp3');
	public static readonly HIHAT = new BeatPlayer('/sound/hihat.mp3');

	public playBeat(): void {
		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}

		this.player?.start();
	}

	public dispose(): void {
		this.player?.dispose();
	}

	public static disposeAll(): void {
		if (browser) {
			this.WOODBLOCK.dispose();
			this.CLICK.dispose();
			this.HIHAT.dispose();
			console.log('All static BeatPlayers disposed.');
		}
	}
}
