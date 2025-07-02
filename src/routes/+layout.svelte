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

<div class="app-container">
	<Header />

	<main>
		<slot />
	</main>

	<Footer />
</div>

<style lang="scss">
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
</style>
