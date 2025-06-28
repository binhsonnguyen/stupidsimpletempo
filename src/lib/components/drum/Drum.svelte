<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { volumeStore } from '$lib/state/volumeStore';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { logger } from '$lib/services/logger';
	import { beatScheduleStore } from '$lib/state/beatScheduleStore';
	import * as Tone from 'tone';
	import { VALID_DIVISIONS } from '$lib/constants';
	import { drumGlowStore } from '$lib/state/drumGlowStore';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import {
		COLOR_ON_RGB,
		COLOR_OFF_RGB,
		COLOR_LOADING_RGB,
		GLOW_SPREAD_STATIC,
		GLOW_SPREAD_PULSE_MIN,
		GLOW_SPREAD_PULSE_MAX,
		GLOW_ALPHA_STATIC,
		GLOW_ALPHA_STATIC_DIM,
		GLOW_ALPHA_PULSE_MIN,
		GLOW_ALPHA_PULSE_MAX
	} from '$lib/config/chromaConstants';
	import DrumDivisionLines from './DrumDivisionLines.svelte';

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
		if (direction === 'down' || direction === 'right') {
			logger.log('⬆️ Swipe Up Detected!');
			beatsPerMeasureAdvance(1);
		} else {
			logger.log('⬇️ Swipe Down Detected!');
			beatsPerMeasureAdvance(-1);
		}
	}

	const easedProximity = $derived(masterProximity ** 2);

	const pulsingSpread = $derived(
		GLOW_SPREAD_PULSE_MIN + easedProximity * (GLOW_SPREAD_PULSE_MAX - GLOW_SPREAD_PULSE_MIN)
	);
	const pulsingAlpha = $derived(
		GLOW_ALPHA_PULSE_MIN + easedProximity * (GLOW_ALPHA_PULSE_MAX - GLOW_ALPHA_PULSE_MIN)
	);

	$effect(() => {
		if ($userInteractionStore) {
			drumGlowStore.setGlow({
				rgb: COLOR_ON_RGB,
				alpha: GLOW_ALPHA_PULSE_MAX,
				spread: GLOW_SPREAD_PULSE_MAX
			});
		} else if ($isAudioLoading) {
			drumGlowStore.setGlow({
				rgb: COLOR_LOADING_RGB,
				alpha: GLOW_ALPHA_STATIC_DIM,
				spread: GLOW_SPREAD_STATIC
			});
		} else if ($metronomeStore.isRunning) {
			drumGlowStore.setGlow({
				rgb: COLOR_ON_RGB,
				alpha: pulsingAlpha,
				spread: pulsingSpread
			});
		} else {
			drumGlowStore.setGlow({
				rgb: COLOR_OFF_RGB,
				alpha: GLOW_ALPHA_STATIC,
				spread: GLOW_SPREAD_STATIC
			});
		}
	});
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
	style="--glow-rgb: {$drumGlowStore.rgb}; --glow-alpha: {$drumGlowStore.alpha}; --glow-spread: {$drumGlowStore.spread}px;"
>
	<DrumDivisionLines {divisions} />
</button>

<style lang="scss">
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
    display: flex;
    justify-content: center;
    align-items: center;

    box-shadow: 0 0 15px var(--glow-spread, 5px) rgba(var(--glow-rgb, '40, 167, 69'), var(--glow-alpha, 0.7));
  }

  .start-stop-button:focus-visible {
    outline: none;
  }
</style>