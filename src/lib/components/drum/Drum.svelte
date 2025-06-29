<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { volumeStore } from '$lib/state/volumeStore';
	import { beatScheduleStore } from '$lib/state/beatScheduleStore';
	import * as Tone from 'tone';
	import { glowStore } from '$lib/state/glowStore';
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
	import DrumDivisionControl from '$lib/components/drum/DrumDivisionControl.svelte';
	import * as Svelte from 'svelte';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';

	let { children } = $props<{ children?: Svelte.Snippet }>();

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

	function handleDrumClick() {
		metronomeStore.toggle();
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
			glowStore.setGlow({
				rgb: COLOR_ON_RGB,
				alpha: GLOW_ALPHA_PULSE_MAX,
				spread: GLOW_SPREAD_PULSE_MAX
			});
		} else if ($isAudioLoading) {
			glowStore.setGlow({
				rgb: COLOR_LOADING_RGB,
				alpha: GLOW_ALPHA_STATIC_DIM,
				spread: GLOW_SPREAD_STATIC
			});
		} else if ($metronomeStore.isRunning) {
			glowStore.setGlow({
				rgb: COLOR_ON_RGB,
				alpha: pulsingAlpha,
				spread: pulsingSpread
			});
		} else {
			glowStore.setGlow({
				rgb: COLOR_OFF_RGB,
				alpha: GLOW_ALPHA_STATIC,
				spread: GLOW_SPREAD_STATIC
			});
		}
	});
</script>

<button
	onclick={handleDrumClick}
	class="start-stop-button"
	aria-label={$isAudioLoading
		? 'Loading sounds...'
		: $metronomeStore.isRunning
		? 'Stop metronome'
		: 'Start metronome'}
	disabled={$isAudioLoading}
	tabindex="-1"
	style="--glow-rgb: {$glowStore.rgb}; --glow-alpha: {$glowStore.alpha}; --glow-spread: {$glowStore.spread}px;"
>
	{#if children}
		{@render children()}
	{:else}
		<DrumDivisionControl enableSwipe={false} showLines={true} />
	{/if}
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

    box-shadow:
            0 0 15px var(--glow-spread, 5px)
            rgba(var(--glow-rgb, '40, 167, 69'), var(--glow-alpha, 0.7));
  }

  .start-stop-button:focus-visible {
    outline: none;
  }
</style>