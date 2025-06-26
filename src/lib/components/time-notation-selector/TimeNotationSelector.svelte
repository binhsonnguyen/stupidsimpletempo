<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { metronomeStore, type BeatInterval } from '$lib/state/metronomeStore';
	import TimeNotationFilmStrip from './TimeNotationFilmStrip.svelte';
	import type { BeatIntervalOption } from './TimeNotationFilmStrip.svelte';

	const BEAT_INTERVAL_OPTIONS: BeatIntervalOption[] = [
		{ label: '1', value: '1m', description: 'Whole Note (Nốt tròn)' },
		{ label: '2', value: '2n', description: 'Half Note (Nốt trắng)' },
		{ label: '4', value: '4n', description: 'Quarter Note (Nốt đen)' },
		{ label: '8', value: '8n', description: 'Eighth Note (Nốt móc đơn)' },
		{ label: '16', value: '16n', description: 'Sixteenth Note (Nốt móc kép)' },
		{ label: '8³', value: '8t', description: 'Eighth Triplet (Chùm ba nốt móc đơn)' }
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