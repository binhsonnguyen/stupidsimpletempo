<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { beatSoundStore } from '$lib/state/beatSoundStore';
	import { wakeLockManager } from '$lib/services/wakeLockManager';
	import '../styles/theme.scss';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	onMount(() => {
		wakeLockManager.initialize();
		beatSequenceStore.initialize();
		const unsubscribe = beatSoundStore.subscribe(() => {});
		onDestroy(unsubscribe);
	});

	onDestroy(() => {
		Sound.disposeAll();
		wakeLockManager.destroy();
	});
</script>

<svelte:body class:audio-loading={$isAudioLoading} />

<Header />

<main class="flex-grow-1 d-flex align-items-center justify-content-center">
	<slot />
</main>

<Footer />