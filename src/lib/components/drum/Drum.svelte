<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { Sound } from '$lib/audio/Sound';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';

	onMount(() => {
		const sequence = get(beatSequenceStore);
		if (sequence.head) {
			Sound.registerForPreload(sequence.head.sound);
		}
	});

	function handleDrumClick() {
		metronomeStore.toggle();
	}
</script>

<button
	on:click={handleDrumClick}
	class="start-stop-button"
	class:on={$metronomeStore.isRunning && !$isAudioLoading}
	class:off={!$metronomeStore.isRunning && !$isAudioLoading}
	class:loading={$isAudioLoading}
	aria-label={$isAudioLoading
		? 'Loading sounds...'
		: $metronomeStore.isRunning
		? 'Stop metronome'
		: 'Start metronome'}
	disabled={$isAudioLoading}
	tabindex="-1"
></button>

<style>
    .start-stop-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        background-color: transparent;
        transition: box-shadow 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .start-stop-button.loading {
        box-shadow: 0 0 15px rgba(108, 117, 125, 0.5);
        cursor: wait;
    }

    .start-stop-button.off {
        box-shadow: 0 0 15px rgba(40, 167, 69, 0.7);
    }

    .start-stop-button.on {
        box-shadow: 0 0 15px rgba(220, 53, 69, 0.7);
    }

    .start-stop-button:focus-visible {
        outline: none;
    }
</style>