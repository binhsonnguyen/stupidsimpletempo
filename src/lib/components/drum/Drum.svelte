<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { volumeStore } from '$lib/state/volumeStore';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { logger } from '$lib/services/logger';
	import { beatScheduleStore } from '$lib/state/beatScheduleStore';
	import * as Tone from 'tone';
	import { VALID_DIVISIONS } from '$lib/constants';

	const divisionOptions = VALID_DIVISIONS;
	let currentDivisionIndex = $state(0);
	const divisions = $derived(VALID_DIVISIONS[currentDivisionIndex]);

	$effect(() => {
		metronomeStore.setBeatsPerMeasure(divisions);
	});

	onMount(() => {
		volumeStore.setVolume(100);
		volumeStore.setBoostFactor(1.2);
	});

	let animationFrameId: number;
	let masterProximity = $state(0);

	$effect(() => {
		const isRunning = $metronomeStore.isRunning;

		function updateLoop() {
			const pot = Tone.now();
			const schedule = beatScheduleStore.getMasterSchedule(pot);

			if (schedule?.proximityToNextBeat !== undefined) {
				masterProximity = schedule.proximityToNextBeat;
			}

			animationFrameId = requestAnimationFrame(updateLoop);
		}

		if (isRunning) {
			animationFrameId = requestAnimationFrame(updateLoop);
		} else {
			masterProximity = 0;
		}

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});

	function beatsPerMeasureAdvance(level: number = 1) {
		const numOptions = divisionOptions.length;
		currentDivisionIndex = (currentDivisionIndex + level + numOptions) % numOptions;
	}

	function handleDrumClick() {
		metronomeStore.toggle();
	}

	function handleSwipe(direction: 'up' | 'down' | 'left' | 'right') {
		if (direction === 'up' || direction === 'right') {
			logger.log('⬆️ Swipe Up Detected!');
			beatsPerMeasureAdvance(1);
		} else {
			logger.log('⬇️ Swipe Down Detected!');
			beatsPerMeasureAdvance(-1);
		}
	}
</script>

<button
	onclick={handleDrumClick}
	use:swipeable
	onswipeup={() => handleSwipe('up')}
	onswipedown={() => handleSwipe('down')}
	onswipeleft={() => handleSwipe('left')}
	onswiperight={() => handleSwipe('right')}
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
				{@const angleOffset = -90}
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

<style lang="scss">
  $color-red: rgb(220, 53, 69);
  $color-green: rgb(40, 167, 69);
  $color-gray: rgb(108, 117, 125);

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
    --drum-glow-color: #{rgba($color-green, 0.7)};
    --line-glow-color: #{rgba($color-green, 0.85)};

    &.on {
      --drum-glow-color: #{rgba($color-red, 0.7)};
      --line-glow-color: #{rgba($color-red, 0.85)};
    }

    &.loading {
      --drum-glow-color: #{rgba($color-gray, 0.5)};
      --line-glow-color: #{rgba($color-gray, 0.7)};
    }

    box-shadow: 0 0 15px var(--drum-glow-color, transparent);
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
    width: 75%;
    height: 1px;
    top: 50%;
    left: 50%;
    transform-origin: 0 50%;
    transform: rotate(var(--rotation-angle));
    transition: background 0.3s ease;
    background: linear-gradient(to right, var(--line-glow-color, transparent), transparent);
  }
</style>