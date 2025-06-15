export class Metronome {
    constructor({ initialBpm, minBpm, maxBpm }) {
        this.minBpm = minBpm
        this.maxBpm = maxBpm
        this.isRunning = false
        this._bpm = this.clampBpm(initialBpm)
    }

    start() {
        this.isRunning = true
    }

    stop() {
        this.isRunning = false
    }

    toggle() {
        this.isRunning = !this.isRunning
    }
    get bpm() {
        return this._bpm;
    }

    set bpm(value) {
        this._bpm = this.clampBpm(value);
    }

    clampBpm(bpm) {
        return Math.max(this.minBpm, Math.min(this.maxBpm, bpm))
    }
}