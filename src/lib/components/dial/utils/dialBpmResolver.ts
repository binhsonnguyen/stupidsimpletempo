// src/lib/components/dial/utils/dialBpmResolver.ts

export interface DialResolverOptions {
	minBpm: number;
	maxBpm: number;
	minBpmAngle: number;
	maxBpmAngle: number;
}

export class DialBpmResolver {
	readonly #minBpm: number;
	readonly #maxBpm: number;
	readonly #minBpmAngle: number;
	readonly #maxBpmAngle: number;
	readonly #bpmRange: number;
	readonly #usableAngleRange: number;

	constructor(options: DialResolverOptions) {
		this.#minBpm = options.minBpm;
		this.#maxBpm = options.maxBpm;
		this.#minBpmAngle = options.minBpmAngle;
		this.#maxBpmAngle = options.maxBpmAngle;
		this.#bpmRange = this.#maxBpm - this.#minBpm;
		this.#usableAngleRange = this.#maxBpmAngle - this.#minBpmAngle;
	}

	/**
	 * Giới hạn một giá trị trong một khoảng cho trước.
	 */
	#clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

	/**
	 * Tính toán BPM từ góc xoay của knob.
	 * @param rotationAngle - Góc xoay hiện tại của knob (giá trị âm).
	 */
	public calculateBpmFromAngle(rotationAngle: number): number {
		const knobAngle = -rotationAngle;
		const effectiveAngle = ((knobAngle % 360) + 360) % 360;
		const clampedAngle = this.#clamp(effectiveAngle, this.#minBpmAngle, this.#maxBpmAngle);

		const angleWithinUsableRange = clampedAngle - this.#minBpmAngle;
		const percentage =
			this.#usableAngleRange > 0 ? angleWithinUsableRange / this.#usableAngleRange : 0;

		return this.#minBpm + percentage * this.#bpmRange;
	}

	/**
	 * Tính toán BPM từ góc vị trí của một cú chạm (hệ tọa độ atan2).
	 * @param positionalAngle - Góc của cú chạm so với tâm.
	 */
	public calculateBpmFromPositionalAngle(positionalAngle: number): number {
		const dialSystemAngle = ((positionalAngle + 90) % 360 + 360) % 360;
		const clampedAngle = this.#clamp(dialSystemAngle, this.#minBpmAngle, this.#maxBpmAngle);

		const angleWithinUsableRange = clampedAngle - this.#minBpmAngle;
		const percentage =
			this.#usableAngleRange > 0 ? angleWithinUsableRange / this.#usableAngleRange : 0;

		return this.#minBpm + percentage * this.#bpmRange;
	}

	/**
	 * Tính toán góc xoay của knob từ một giá trị BPM.
	 * @param bpm - Giá trị BPM.
	 */
	public calculateAngleFromBpm(bpm: number): number {
		const percentage = this.#bpmRange > 0 ? (bpm - this.#minBpm) / this.#bpmRange : 0;
		const angle = this.#minBpmAngle + percentage * this.#usableAngleRange;
		return -angle;
	}
}