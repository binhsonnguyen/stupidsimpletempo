<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { metronomeStore, type BeatInterval } from '$lib/state/metronomeStore';
	import TimeNotationFilmStrip from './TimeNotationFilmStrip.svelte';
	import type { BeatIntervalOption } from './TimeNotationFilmStrip.svelte';

	const BEAT_INTERVAL_OPTIONS: BeatIntervalOption[] = [
		{ label: '⚬', value: '1m', description: 'Whole Note (Nốt tròn)', symbol: '⚬' },
		{ label: '½', value: '2n', description: 'Half Note (Nốt trắng)', symbol: '𝅗𝅥' },
		{ label: '¼', value: '4n', description: 'Quarter Note (Nốt đen)', symbol: '𝅘𝅥' },
		{ label: '⅛', value: '8n', description: 'Eighth Note (Nốt móc đơn)', symbol: '𝅘𝅥𝅮' },
		{ label: '¹⁄₁₆', value: '16n', description: 'Sixteenth Note (Nốt móc kép)', symbol: '𝅘𝅥𝅯' },
		{ label: '⅛³', value: '8t', description: 'Eighth Triplet (Chùm ba)', symbol: '𝅘𝅥𝅮³' }
	];

	function handleSelectionChange(event: CustomEvent<BeatInterval>) {
		metronomeStore.setBeatInterval(event.detail);
	}
</script>

<div class="notation-wrapper">
	<TimeNotationFilmStrip
		options={BEAT_INTERVAL_OPTIONS}
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