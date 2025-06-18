export enum BeatType {
    Accent = 'accent',
    Regular = 'regular',
}

export interface BeatConstructorParams {
    type?: BeatType;
    durationFactor?: number
}

export class Beat {
    get nextBeat(): Nullable<Beat> {
        return this._nextBeat;
    }

    set nextBeat(value: Nullable<Beat>) {
        this._nextBeat = value;
    }
    private _nextBeat: Nullable<Beat> = null;
    get durationFactor(): number {
        return this._durationFactor;
    }

    set durationFactor(value: number) {
        this._durationFactor = value;
    }
    private _durationFactor: number;
    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }
    private _type: string;
    /**
     * Khởi tạo một đối tượng Beat.
     * @param {object} [options={}] - Các thuộc tính của beat.
     * @param {string} [options.type='regular'] - Kiểu của beat ('accent' hoặc 'regular').
     * @param {number} [options.durationFactor=1.0] - Hệ số trường độ.
     */
    constructor ({ type = BeatType.Regular, durationFactor = 1.0 }: BeatConstructorParams) {
        this._type = type
        this._durationFactor = durationFactor
        this._nextBeat = null
    }

    setNext(next: Beat) {
        this.nextBeat = next
        return next
    }
}