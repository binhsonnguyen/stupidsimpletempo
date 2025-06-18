interface MetronomeConstructorParams {
    initialBpm: number;
    minBpm: number;
    maxBpm: number;
}

export class Metronome {
    private _bpm: number;
    private _isRunning: boolean;
    private readonly _minBpm: number;
    private readonly _maxBpm: number;

    constructor({ initialBpm, minBpm, maxBpm }: MetronomeConstructorParams) {
        this._minBpm = minBpm;
        this._maxBpm = maxBpm;
        this._isRunning = false;
        this._bpm = this.clampBpm(initialBpm);
    }

    get bpm(): number {
        return this._bpm;
    }

    set bpm(value: number) {
        this._bpm = this.clampBpm(value);
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    get minBpm(): number {
        return this._minBpm;
    }

    get maxBpm(): number {
        return this._maxBpm;
    }

    start(): void {
        this._isRunning = true;
    }

    stop(): void {
        this._isRunning = false;
    }

    toggle(): void {
        this._isRunning = !this._isRunning;
    }

    private clampBpm(bpm: number): number {
        return Math.max(this._minBpm, Math.min(this._maxBpm, bpm));
    }
}