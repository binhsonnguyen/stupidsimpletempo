<!-- src/lib/components/drum/DrumDivisionControl.svelte -->

<script lang="ts">
	import { get } from 'svelte/store';
	import { swipeable } from '$lib/components/actions/swipeable';
	import { logger } from '$lib/services/logger';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { VALID_DIVISIONS } from '$lib/constants';
	import DrumDivisionLines from './DrumDivisionLines.svelte';

	let currentDivisionIndex = $state(
		VALID_DIVISIONS.indexOf(get(metronomeStore).beatsPerMeasure)
	);
	const divisions = $derived(VALID_DIVISIONS[currentDivisionIndex]);

	$effect(() => {
		metronomeStore.setBeatsPerMeasure(divisions);
	});

	function beatsPerMeasureAdvance(level: number = 1) {
		const numOptions = VALID_DIVISIONS.length;
		currentDivisionIndex = (currentDivisionIndex + level + numOptions) % numOptions;
	}

	function handleSwipeDirection(direction: 'up' | 'down' | 'left' | 'right') {
		if (direction === 'down' || direction === 'right') {
			logger.log('Divisions increased');
			beatsPerMeasureAdvance(1);
		} else {
			logger.log('Divisions decreased');
			beatsPerMeasureAdvance(-1);
		}
	}
</script>

<div
	class="control-overlay"
	use:swipeable
	onswipestart={userInteractionStore.startInteraction}
	onswipeend={userInteractionStore.endInteraction}
	onswipeup={() => handleSwipeDirection('up')}
	onswipedown={() => handleSwipeDirection('down')}
	onswipeleft={() => handleSwipeDirection('left')}
	onswiperight={() => handleSwipeDirection('right')}
>
	<DrumDivisionLines {divisions} />
</div>

<style>
    .control-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        cursor: grab;
    }

    .control-overlay:active {
        cursor: grabbing;
    }
</style>