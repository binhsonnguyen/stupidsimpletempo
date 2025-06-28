<!-- src/lib/components/drum/DrumDivisionControl.svelte -->

<script lang="ts">
	import { swipeable } from '$lib/components/actions/swipeable';
	import { logger } from '$lib/services/logger';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { VALID_DIVISIONS } from '$lib/constants';
	import DrumDivisionLines from './DrumDivisionLines.svelte';

	let { enableSwipe = true, showLines = true } = $props<{
		enableSwipe?: boolean;
		showLines?: boolean;
	}>();

	const divisions = $derived($metronomeStore.timeSignature.beatsPerMeasure);

	function handleSwipeDirection(direction: 'up' | 'down' | 'left' | 'right') {
		if (!enableSwipe) return;

		const currentBeats = $metronomeStore.timeSignature.beatsPerMeasure;
		const currentIndex = VALID_DIVISIONS.indexOf(currentBeats);

		const delta = direction === 'down' || direction === 'right' ? 1 : -1;
		const nextIndex = (currentIndex + delta + VALID_DIVISIONS.length) % VALID_DIVISIONS.length;
		const nextBeats = VALID_DIVISIONS[nextIndex];

		if (direction === 'down' || direction === 'right') {
			logger.log('Divisions increased');
		} else {
			logger.log('Divisions decreased');
		}

		metronomeStore.setBeatsPerMeasure(nextBeats);
	}

	function handleSwipeStart() {
		if (!enableSwipe) return;
		userInteractionStore.startInteraction();
	}

	function handleSwipeEnd() {
		if (!enableSwipe) return;
		userInteractionStore.endInteraction();
	}
</script>

<div
	class="control-overlay"
	class:interactive={enableSwipe}
	use:swipeable
	onswipestart={handleSwipeStart}
	onswipeend={handleSwipeEnd}
	onswipeup={() => handleSwipeDirection('up')}
	onswipedown={() => handleSwipeDirection('down')}
	onswipeleft={() => handleSwipeDirection('left')}
	onswiperight={() => handleSwipeDirection('right')}
>
	{#if showLines}
		<DrumDivisionLines {divisions} />
	{/if}
</div>

<style>
    .control-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        cursor: default;
    }

    .control-overlay.interactive {
        cursor: grab;
    }

    .control-overlay.interactive:active {
        cursor: grabbing;
    }
</style>