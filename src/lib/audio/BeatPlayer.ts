// src/lib/audio/BeatPlayer.ts

import * as Tone from 'tone';

export class BeatPlayer {
	private player: Tone.Player | null = null;

	constructor(soundUrl: string) {
		this.player = new Tone.Player(soundUrl).toDestination();
	}

	public playBeat(): void {
		if (!this.player) {
			return;
		}

		if (Tone.getContext().state !== 'running') {
			Tone.start();
		}

		this.player.start();
	}

	public dispose(): void {
		this.player?.dispose();
	}
}