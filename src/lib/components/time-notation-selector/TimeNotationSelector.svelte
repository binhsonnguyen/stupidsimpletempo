<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import type { BeatInterval } from '$lib/constants';
	import TimeNotationFilmStrip from './TimeNotationFilmStrip.svelte';
	import type { BeatIntervalOption } from './TimeNotationFilmStrip.svelte';
	import { makeFraction } from '$lib/utils/fractionGenerator';

	const beatIntervalToDenominator: Record<BeatInterval, number> = {
		'1m': 1,
		'2n': 2,
		'4n': 4,
		'8n': 8,
		'16n': 16,
		'8t': 8
	};

	const BASE_OPTIONS: Omit<BeatIntervalOption, 'timeSignatureLabel'>[] = [
		{ label: '⚬', value: '1m', description: 'Whole Note (Nốt tròn)', symbol: '⚬' },
		{ label: '½', value: '2n', description: 'Half Note (Nốt trắng)', symbol: '𝅗𝅥' },
		{ label: '¼', value: '4n', description: 'Quarter Note (Nốt đen)', symbol: '𝅘𝅥' },
		{ label: '⅛', value: '8n', description: 'Eighth Note (Nốt móc đơn)', symbol: '𝅘𝅥𝅮' },
		{ label: '¹⁄₁₆', value: '16n', description: 'Sixteenth Note (Nốt móc kép)', symbol: '𝅘𝅥𝅯' },
		{ label: '⅛³', value: '8t', description: 'Eighth Triplet (Chùm ba)', symbol: '𝅘𝅥𝅮³' }
	];

	$: optionsWithTimeSignature = BASE_OPTIONS.map((option) => {
		const denominator = beatIntervalToDenominator[option.value] || 0;
		return {
			...option,
			timeSignatureLabel: makeFraction($metronomeStore.beatsPerMeasure, denominator)
		};
	});

	function handleSelectionChange(event: CustomEvent<BeatInterval>) {
		metronomeStore.setBeatInterval(event.detail);
	}
</script>

<div class="notation-wrapper">
	<TimeNotationFilmStrip
		options={optionsWithTimeSignature}
		initialValue={$metronomeStore.beatInterval}
		on:change={handleSelectionChange}
	/>
</div>

<style>
    .notation-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
</style>