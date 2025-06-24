<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { wakeLockService } from '$lib/services/wakeLockService'; // 1. Import service
	import '../styles/theme.scss';

	onMount(async () => {
		wakeLockService.initialize();

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