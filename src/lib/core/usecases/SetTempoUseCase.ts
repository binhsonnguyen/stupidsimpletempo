// src/lib/core/usecases/SetTempoUseCase.ts
import { metronomeStore } from '$lib/state/metronomeStore';
import type { ISetTempoUseCase } from '../ports/ISetTempoUseCase';

export class SetTempoUseCase implements ISetTempoUseCase {
	execute(bpm: number): void {
		const roundedBpm = Math.round(bpm);
		metronomeStore.setBpm(roundedBpm);
	}
}