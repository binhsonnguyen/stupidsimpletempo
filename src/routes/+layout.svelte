<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { wakeLockManager } from '$lib/services/wakeLockManager';
	import '../styles/theme.scss';

	let unsubscribeMetronome: (() => void) | undefined;

	onMount(() => {
		wakeLockManager.initialize();

		unsubscribeMetronome = metronomeStore.subscribe(async ({ beatsPerMeasure }) => {
			await beatSequenceStore.setSequence(beatsPerMeasure);
		});
	});

	onDestroy(() => {
		Sound.disposeAll();
		wakeLockManager.destroy();

		if (unsubscribeMetronome) {
			unsubscribeMetronome();
		}
	});
</script>

<svelte:body class:audio-loading={$isAudioLoading} />

<slot />