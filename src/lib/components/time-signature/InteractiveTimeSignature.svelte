<!-- src/lib/components/time-signature/InteractiveTimeSignature.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { VALID_BEAT_INTERVALS, VALID_DIVISIONS, type BeatInterval, type Division } from '$lib/constants';
	import type { TimeSignature } from '$lib/models/TimeSignature';

	let { timeSignature } = $props<{
		timeSignature: TimeSignature;
	}>();

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
</div>

<style>
    .time-signature-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: grab;
        user-select: none;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background-color 0.2s;
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
    }
</style>