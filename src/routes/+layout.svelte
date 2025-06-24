<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { tick } from 'svelte'; // 1. Import tick
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import '../styles/theme.scss';

	onMount(async () => {
		// Đợi một "tick" để đảm bảo tất cả các onMount của component con đã chạy
		// và đã đăng ký xong âm thanh của chúng.
		await tick();

		await Sound.preloadRegisteredSounds();

		isAudioLoading.set(false);
	});

	onDestroy(() => {
		Sound.disposeAll();
	});
</script>


<svelte:body class:audio-loading={$isAudioLoading} />

<slot />