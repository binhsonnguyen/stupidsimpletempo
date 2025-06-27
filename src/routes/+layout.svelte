<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { wakeLockManager } from '$lib/services/wakeLockManager';
	import '../styles/theme.scss';

	onMount(() => {
		wakeLockManager.initialize();
		beatSequenceStore.initialize();
	});

	onDestroy(() => {
		Sound.disposeAll();
		wakeLockManager.destroy();
	});
</script>

<svelte:body class:audio-loading={$isAudioLoading} />

<slot />