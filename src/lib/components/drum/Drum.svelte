<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { Sound } from '$lib/audio/Sound';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { volumeStore } from '$lib/state/volumeStore';
	import { swipeable } from '$lib/components/actions/swipeable';

	const divisionOptions = [1, 2, 3, 4, 6, 8];
	let currentDivisionIndex = 0;

	$: divisions = divisionOptions[currentDivisionIndex];

	onMount(() => {
		const sequence = get(beatSequenceStore);
		if (sequence.head) {
			Sound.registerForPreload(sequence.head.sound);
		}
		volumeStore.setVolume(100);
		volumeStore.setBoostFactor(1.1);
	});

	function handleDrumClick() {
		metronomeStore.toggle();
	}

	function cycleDivisions(direction: 'up' | 'down') {
		if (direction === 'up') {
			currentDivisionIndex = (currentDivisionIndex + 1) % divisionOptions.length;
		} else {
			currentDivisionIndex =
				(currentDivisionIndex - 1 + divisionOptions.length) % divisionOptions.length;
		}
	}

	function handleSwipeLeft() {
		console.log('⬅️ Swipe Left Detected!');
	}

	function handleSwipeRight() {
		console.log('➡️ Swipe Right Detected!');
	}
</script>

<button
	onclick={handleDrumClick}
	use:swipeable
	onswipeup={() => cycleDivisions('up')}
	onswipedown={() => cycleDivisions('down')}
	onswipeleft={handleSwipeLeft}
	onswiperight={handleSwipeRight}
	class="start-stop-button"
	class:on={$metronomeStore.isRunning && !$isAudioLoading}
	class:off={!$metronomeStore.isRunning && !$isAudioLoading}
	class:loading={$isAudioLoading}
class:divisions-2={divisions === 2}
class:divisions-3={divisions === 3}
class:divisions-4={divisions === 4}
class:divisions-6={divisions === 6}
class:divisions-8={divisions === 8}
aria-label={$isAudioLoading
	? 'Loading sounds...'
	: $metronomeStore.isRunning
		? 'Stop metronome'
		: 'Start metronome'}
disabled={$isAudioLoading}
tabindex="-1"
>
<div class="division-lines-container">
	{#if divisions > 1}
		{#each Array(divisions) as _, i (i)}
			{@const angleOffset = divisions === 3 ? -90 : 0}
			{@const angle = (i / divisions) * 360 + angleOffset}
			<div
				class="division-line"
				style="--rotation-angle: {angle}deg;"
				transition:fade={{ duration: 150 }}
			></div>
		{/each}
	{/if}
</div>
</button>

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

    .division-lines-container {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .division-line {
        position: absolute;
        width: 25%;
        height: 1px;
        background-color: rgba(248, 249, 250, 0.5);
        top: 50%;
        left: 50%;
        transform-origin: 0 50%;
        transform: rotate(var(--rotation-angle));
    }
</style>