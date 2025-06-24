// src/lib/core/ports/ISetTempoUseCase.ts

/**
 * Interface cho use case thiết lập tempo của metronome.
 */
export interface IToggleUseCase {
	/**
	 * Thực thi việc thiết lập một giá trị BPM mới.
	 * @param bpm - Giá trị Beats Per Minute mới.
	 */
	execute(): void;
}