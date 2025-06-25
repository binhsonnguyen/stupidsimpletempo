<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Sound } from '$lib/audio/Sound';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { wakeLockService } from '$lib/services/wakeLockService';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import '../styles/theme.scss';

	let unsubscribeMetronome: (() => void) | undefined;

	onMount(async () => {
		wakeLockService.initialize();

		// Đăng ký beatSequenceStore với metronomeStore
		// Việc này đảm bảo cả hai store đã được khởi tạo trước khi đăng ký
		unsubscribeMetronome = metronomeStore.subscribe(({ beatsPerMeasure }) => {
			beatSequenceStore.setSequence(beatsPerMeasure);
		});

		// Đợi một "tick" để đảm bảo tất cả các onMount của component con đã chạy
		// và đã đăng ký xong âm thanh của chúng.
		await tick();

		await Sound.preloadRegisteredSounds();

		isAudioLoading.set(false);
	});

	onDestroy(() => {
		Sound.disposeAll();
		if (unsubscribeMetronome) {
			unsubscribeMetronome();
		}
	});
</script>

<svelte:body class:audio-loading={$isAudioLoading} />

<slot />