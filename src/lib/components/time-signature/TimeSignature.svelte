<!-- src/lib/components/time-signature/TimeSignature.svelte -->
<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import type { BeatInterval, Division } from '$lib/constants';
	import InteractiveTimeSignature from './InteractiveTimeSignature.svelte';

	function handleChangeBeats(event: CustomEvent<Division>) {
		metronomeStore.setBeatsPerMeasure(event.detail);
	}

	function handleChangeInterval(event: CustomEvent<BeatInterval>) {
		metronomeStore.setBeatInterval(event.detail);
	}
</script>

<div class="notation-wrapper">
	<InteractiveTimeSignature
		beatsPerMeasure={$metronomeStore.beatsPerMeasure}
		beatInterval={$metronomeStore.beatInterval}
		on:changeBeats={handleChangeBeats}
		on:changeInterval={handleChangeInterval}
	/>
</div>

<style>
    .notation-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-bottom: 10px;
    }
</style>