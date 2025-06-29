<!-- src/lib/components/time-signature/InteractiveTimeSignature.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { glowStore } from '$lib/state/glowStore';
	import { VALID_BEAT_INTERVALS, VALID_DIVISIONS, type BeatInterval, type Division } from '$lib/constants';
	import type { TimeSignature } from '$lib/models/timeSignature';

	let { timeSignature } = $props<{
		timeSignature: TimeSignature;
	}>();

	const TINT_INTENSITY_FACTOR = 0.8;
	const tintIntensity = $derived($glowStore.baseIntensity * TINT_INTENSITY_FACTOR);

	const dispatch = createEventDispatcher<{
		changeBeats: Division;
		changeInterval: BeatInterval;
	}>();

	function handleBeatsChange(direction: 'up' | 'down') {
		const currentIndex = VALID_DIVISIONS.indexOf(timeSignature.beatsPerMeasure);
		const delta = direction === 'up' ? 1 : -1;
		const nextIndex = (currentIndex + delta + VALID_DIVISIONS.length) % VALID_DIVISIONS.length;
		dispatch('changeBeats', VALID_DIVISIONS[nextIndex]);
	}

	function handleIntervalChange(direction: 'left' | 'right') {
		const currentIndex = VALID_BEAT_INTERVALS.indexOf(timeSignature.beatInterval);
		const delta = direction === 'right' ? 1 : -1;
		const nextIndex = (currentIndex + delta + VALID_BEAT_INTERVALS.length) % VALID_BEAT_INTERVALS.length;
		dispatch('changeInterval', VALID_BEAT_INTERVALS[nextIndex]);
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
			style="--glow-rgb: {$glowStore.rgb}; --tint-intensity: {tintIntensity};"
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