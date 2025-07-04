<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { beatSoundStore } from '$lib/state/beatSoundStore';
	import { wakeLockManager } from '$lib/services/wakeLockManager';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import '../styles/theme.scss';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { firstInteractionStore } from '$lib/state/firstInteractionStore';

	onMount(() => {
		beatSequenceStore.initialize();
		const unsubscribe = beatSoundStore.subscribe(() => {
		});
		wakeLockManager.initialize();

		const firstInteractiveOptions = { once: true, passive: true };
		window.addEventListener('mousedown', firstInteractionStore.recordFirstInteraction, firstInteractiveOptions);
		window.addEventListener('touchstart', firstInteractionStore.recordFirstInteraction, firstInteractiveOptions);
		window.addEventListener('keydown', firstInteractionStore.recordFirstInteraction, firstInteractiveOptions);

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

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh; /* Cung cấp giá trị cũ làm fallback cho các trình duyệt không hỗ trợ dvh */
        min-height: 100dvh; /* Sử dụng đơn vị viewport động để tính đến các thanh công cụ của trình duyệt */
    }

    main {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
</style>