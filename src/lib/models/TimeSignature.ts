// src/lib/models/TimeSignature.ts

import type { BeatInterval, Division } from '$lib/constants';
import { makeFraction } from '$lib/utils/fractionGenerator';

const BEAT_INTERVAL_TO_SYMBOL: Record<BeatInterval, string> = {
	'1m': '𝅝', // Whole note
	'2n': '𝅗𝅥', // Half note
	'4n': '𝅘𝅥', // Quarter note
	'8n': '𝅘𝅥𝅮', // Eighth note
	'16n': '𝅘𝅥𝅯', // Sixteenth note
	'8t': '𝅘𝅥𝅮³' // Eighth triplet
};

const BEAT_INTERVAL_TO_DENOMINATOR: Record<BeatInterval, string> = {
	'1m': '1',
	'2n': '2',
	'4n': '4',
	'8n': '8',
	'16n': '16',
	'8t': '8³'
};

export class TimeSignature {
	readonly beatsPerMeasure: Division;
	readonly beatInterval: BeatInterval;

	constructor(beatsPerMeasure: Division, beatInterval: BeatInterval) {
		this.beatsPerMeasure = beatsPerMeasure;
		this.beatInterval = beatInterval;
	}

	/**
	 * Lấy ký hiệu nốt nhạc tương ứng.
	 */
	get beatIntervalSymbol(): string {
		return BEAT_INTERVAL_TO_SYMBOL[this.beatInterval] || '𝅘𝅥';
	}

	/**
	 * Lấy mẫu số dưới dạng số.
	 */
	get beatIntervalDenominator(): string {
		return BEAT_INTERVAL_TO_DENOMINATOR[this.beatInterval] || '4';
	}

	/**
	 * Lấy chuỗi ký tự phân số đã được định dạng.
	 */
	get fraction(): string {
		return makeFraction(this.beatsPerMeasure, this.beatIntervalDenominator);
	}

	/**
	 * Tạo một bản sao mới với beatsPerMeasure đã thay đổi.
	 */
	withBeats(newBeats: Division): TimeSignature {
		return new TimeSignature(newBeats, this.beatInterval);
	}

	/**
	 * Tạo một bản sao mới với beatInterval đã thay đổi.
	 */
	withInterval(newInterval: BeatInterval): TimeSignature {
		return new TimeSignature(this.beatsPerMeasure, newInterval);
	}
}