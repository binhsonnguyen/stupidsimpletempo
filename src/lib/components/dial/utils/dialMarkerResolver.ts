// src/lib/components/dial/utils/dialMarkerResolver.ts

export interface DialMarkerResolverOptions {
	minBpm: number;
	maxBpm: number;
	minBpmAngle: number;
	maxBpmAngle: number;
}

export class DialMarkerResolver {
	readonly #minBpm: number;
	readonly #maxBpm: number;
	readonly #minBpmAngle: number;
	readonly #maxBpmAngle: number;
	readonly #bpmRange: number;
	readonly #usableAngleRange: number;

	constructor(options: DialMarkerResolverOptions) {
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
	 * Tính toán BPM từ góc xoay của dial.
	 * @param rotationAngle - Góc xoay hiện tại của knob (giá trị âm).
	 */
	public calculateBpmFromDialRotation(rotationAngle: number): number {
		const knobAngle = -rotationAngle;
		const effectiveAngle = ((knobAngle % 360) + 360) % 360;
		const clampedAngle = this.#clamp(effectiveAngle, this.#minBpmAngle, this.#maxBpmAngle);

		const angleWithinUsableRange = clampedAngle - this.#minBpmAngle;
		const percentage =
			this.#usableAngleRange > 0 ? angleWithinUsableRange / this.#usableAngleRange : 0;

		return this.#minBpm + percentage * this.#bpmRange;
	}

	/**
	 * Tính toán vạch BPM ứng với góc của một vị trí.
	 * @param positionalAngle - Góc của cú chạm so với tâm.
	 * @param currentDialRotation - Góc xoay hiện tại của dial.
	 */
	public calculateBpmFromPositionalAngle(positionalAngle: number, currentDialRotation: number): number {
		const angleOnDialFace = positionalAngle - currentDialRotation;
		const dialSystemAngle = (((angleOnDialFace + 90) % 360) + 360) % 360;
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

	/**
	 * Tính toán góc xoay cuối cùng để đi theo con đường ngắn nhất.
	 * @param targetAngle - Góc đích đến.
	 * @param currentAngle - Góc hiện tại.
	 * @returns Góc đích đã được điều chỉnh.
	 */
	public calculateShortestRotation(targetAngle: number, currentAngle: number): number {
		let finalAngle = targetAngle;
		const delta = finalAngle - currentAngle;

		if (delta > 180) {
			finalAngle -= 360;
		} else if (delta < -180) {
			finalAngle += 360;
		}
		return finalAngle;
	}
}