<!-- src/lib/components/time-signature/InteractiveTimeSignature.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { VALID_BEAT_INTERVALS, VALID_DIVISIONS, type BeatInterval, type Division } from '$lib/constants';

	let { beatsPerMeasure, beatInterval } = $props<{
		beatsPerMeasure: Division;
		beatInterval: BeatInterval;
	}>();

	const dispatch = createEventDispatcher<{
		changeBeats: Division;
		changeInterval: BeatInterval;
	}>();

	const beatIntervalToSymbol: Record<BeatInterval, string> = {
		'1m': '𝅝', // Whole note
		'2n': '𝅗𝅥', // Half note
		'4n': '𝅘𝅥', // Quarter note
		'8n': '𝅘𝅥𝅮', // Eighth note
		'16n': '𝅘𝅥𝅯', // Sixteenth note
		'8t': '𝅘𝅥𝅮³' // Eighth triplet
	};

	const beatIntervalSymbol = $derived(beatIntervalToSymbol[beatInterval] || '𝅘𝅥');

	function handleBeatsChange(direction: 'up' | 'down') {
		const currentIndex = VALID_DIVISIONS.indexOf(beatsPerMeasure);
		const delta = direction === 'up' ? 1 : -1;
		const nextIndex = (currentIndex + delta + VALID_DIVISIONS.length) % VALID_DIVISIONS.length;
		dispatch('changeBeats', VALID_DIVISIONS[nextIndex]);
	}

	function handleIntervalChange(direction: 'left' | 'right') {
		const currentIndex = VALID_BEAT_INTERVALS.indexOf(beatInterval);
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
	<span class="beats-per-measure">{beatsPerMeasure}</span>
	<span class="beat-interval-symbol music-note-font">{beatIntervalSymbol}</span>
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
    }

    .time-signature-container:active {
        cursor: grabbing;
    }

    .beats-per-measure {
        font-size: 1.5rem;
        font-weight: 500;
        line-height: 1;
        color: white;
    }

    .beat-interval-symbol {
        font-size: 2.5rem;
        line-height: 1;
        color: white;
    }

    .music-note-font {
        font-family: 'Noto Music', sans-serif;
    }
</style>