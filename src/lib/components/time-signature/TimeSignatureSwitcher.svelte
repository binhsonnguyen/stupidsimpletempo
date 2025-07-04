<!-- src/lib/components/time-signature/TimeSignatureSwitcher.svelte -->
<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import InteractiveTimeSignature from './InteractiveTimeSignature.svelte';
	import { settingsStore } from '$lib/state/settingsStore';

	const enabledBeats = $derived($settingsStore.enabledDivisions ?? []);
	const enabledIntervals = $derived($settingsStore.enabledBeatIntervals ?? []);
</script>

<div class="notation-wrapper">
	<InteractiveTimeSignature
		timeSignature={$metronomeStore.timeSignature}
		{enabledBeats}
		{enabledIntervals}
		onchangeBeats={metronomeStore.setBeatsPerMeasure}
		onchangeInterval={metronomeStore.setBeatInterval}
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
