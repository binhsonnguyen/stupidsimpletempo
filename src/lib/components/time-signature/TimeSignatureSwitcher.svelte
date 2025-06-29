<!-- src/lib/components/time-signature/TimeSignatureSwitcher.svelte -->
<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import InteractiveTimeSignature from './InteractiveTimeSignature.svelte';
</script>

<div class="notation-wrapper">
	<InteractiveTimeSignature
		timeSignature={$metronomeStore.timeSignature}
		on:changeBeats={(event) => metronomeStore.setBeatsPerMeasure(event.detail)}
		on:changeInterval={(event) => metronomeStore.setBeatInterval(event.detail)}
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