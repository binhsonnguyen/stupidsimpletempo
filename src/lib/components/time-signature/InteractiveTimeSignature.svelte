<!-- src/lib/components/time-signature/InteractiveTimeSignature.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { dialGlowStore } from '$lib/state/chromaStore';
	import type { BeatInterval, Division } from '$lib/constants';
	import type { TimeSignature } from '$lib/models/timeSignature';

	let {
		timeSignature,
		enabledBeats,
		enabledIntervals
	} = $props<{
		timeSignature: TimeSignature;
		enabledBeats: Division[];
		enabledIntervals: BeatInterval[];
	}>();

	const TINT_INTENSITY_FACTOR = 0.8;
	const tintIntensity = $derived($dialGlowStore.baseIntensity * TINT_INTENSITY_FACTOR);

	const dispatch = createEventDispatcher<{
		changeBeats: Division;
		changeInterval: BeatInterval;
	}>();

	function handleBeatsChange(direction: 'up' | 'down') {
		if (enabledBeats.length === 0) return;

		const currentIndex = enabledBeats.indexOf(timeSignature.beatsPerMeasure);
		const delta = direction === 'up' ? 1 : -1;

		const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

		const nextIndex = (safeCurrentIndex + delta + enabledBeats.length) % enabledBeats.length;
		dispatch('changeBeats', enabledBeats[nextIndex]);
	}

	function handleIntervalChange(direction: 'left' | 'right') {
		if (enabledIntervals.length === 0) return;

		const currentIndex = enabledIntervals.indexOf(timeSignature.beatInterval);
		const delta = direction === 'right' ? 1 : -1;

		const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

		const nextIndex = (safeCurrentIndex + delta + enabledIntervals.length) % enabledIntervals.length;
		dispatch('changeInterval', enabledIntervals[nextIndex]);
	}

	function handleSwipeStart() {
		userInteractionStore.startInteraction();
	}

	function handleSwipeEnd() {
		userInteractionStore.endInteraction();
	}
</script>

<div
	class="time-signature-container"
	class:is-interacting={$userInteractionStore}
	use:swipeable
	onswipestart={handleSwipeStart}
	onswipeend={handleSwipeEnd}
	onswipeup={() => handleBeatsChange('up')}
	onswipedown={() => handleBeatsChange('down')}
	onswipeleft={() => handleIntervalChange('left')}
	onswiperight={() => handleIntervalChange('right')}
	role="button"
	aria-label="Change time signature"
	tabindex="-1"
>
	<span class="time-signature-fraction">{timeSignature.fraction}</span>

	{#if $userInteractionStore}
		<div
			class="interaction-cues"
			transition:fade={{ duration: 150 }}
			style="--glow-rgb: {$dialGlowStore.rgb}; --tint-intensity: {tintIntensity};"
		>
			<div class="arrow arrow-up">
				<div class="arrow-line"></div>
				<div class="arrow-line"></div>
			</div>
			<div class="arrow arrow-down">
				<div class="arrow-line"></div>
				<div class="arrow-line"></div>
			</div>
			<div class="arrow arrow-left">
				<div class="arrow-line"></div>
				<div class="arrow-line"></div>
			</div>
			<div class="arrow arrow-right">
				<div class="arrow-line"></div>
				<div class="arrow-line"></div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
  .time-signature-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    padding: 8px 16px;
    border-radius: 8px;
    transition: background-color 0.2s,
    transform 0.2s ease-out;
    min-height: 60px;
    min-width: 60px;
  }

  .time-signature-container:active {
    cursor: grabbing;
  }

  .time-signature-fraction {
    font-size: 1.4rem;
    font-weight: lighter;
    line-height: 1;
    color: #dee2e6;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s ease-out,
    transform 0.2s ease-out;
  }

  .time-signature-container.is-interacting .time-signature-fraction {
    color: white;
    transform: scale(1.1);
  }

  .interaction-cues {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    --arrow-offset-from-center: 38px;
  }

  .arrow-line {
    position: absolute;
    width: 10px;
    height: 1px;
    top: 50%;
    left: 50%;
    transform-origin: 0 50%;

    $base-color: #6c757d;
    background: linear-gradient(
                    to right,
                    color-mix(in srgb, rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%), $base-color),
                    transparent
    );
    transition: background 0.1s ease;
  }

  .arrow {
    position: absolute;
    width: 1px;
    height: 1px;
  }

  .arrow-up {
    top: calc(50% - var(--arrow-offset-from-center));
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .arrow-down {
    top: calc(50% + var(--arrow-offset-from-center));
    left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
  }

  .arrow-left {
    left: calc(50% - var(--arrow-offset-from-center));
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .arrow-right {
    left: calc(50% + var(--arrow-offset-from-center));
    top: 50%;
    transform: translate(-50%, -50%) rotate(180deg);
  }

  .arrow .arrow-line:nth-child(1) {
    transform: rotate(45deg);
  }

  .arrow .arrow-line:nth-child(2) {
    transform: rotate(-45deg);
  }
</style>