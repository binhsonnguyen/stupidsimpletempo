export class Metronome {
    constructor({ initialBpm, minBpm, maxBpm }) {
        this.minBpm = minBpm
        this.maxBpm = maxBpm
        this.isRunning = false
        this.bpm = this.clampBpm(initialBpm)
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

    setBpm(newBpm) {
        this.bpm = this.clampBpm(newBpm)
    }

    clampBpm(bpm) {
        return Math.max(this.minBpm, Math.min(this.maxBpm, bpm))
    }
}