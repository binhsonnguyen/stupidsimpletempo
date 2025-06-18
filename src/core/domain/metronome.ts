export class Metronome {
    get bpm(): number {
        return this._bpm;
    }

    set bpm(value: number) {
        this._bpm = value;
    }

    private _bpm: number;

    get isRunning(): boolean {
        return this._isRunning;
    }

    set isRunning(value: boolean) {
        this._isRunning = value;
    }

    private _isRunning: boolean;

    get minBpm(): number {
        return this._minBpm;
    }

    set minBpm(value: number) {
        this._minBpm = value;
    }

    get maxBpm(): number {
        return this._maxBpm;
    }

    set maxBpm(value: number) {
        this._maxBpm = value;
    }

    private _minBpm: number;
    private _maxBpm: number;

    constructor({ initialBpm, minBpm, maxBpm }) {
        this._minBpm = minBpm
        this._maxBpm = maxBpm
        this._isRunning = false
        this._bpm = this.clampBpm(initialBpm)
    }

    start() {
        this._isRunning = true
    }

    stop() {
        this._isRunning = false
    }

    toggle() {
        this._isRunning = !this._isRunning
    }

    clampBpm(bpm: number) {
        return Math.max(this._minBpm, Math.min(this._maxBpm, bpm))
    }
}