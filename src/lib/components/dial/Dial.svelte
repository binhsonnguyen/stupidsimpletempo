<!-- src/lib/components/dial/Dial.svelte -->

<script lang="ts">
	import { get } from 'svelte/store';
	import { Tween } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';

	import Drum from '$lib/components/drum/Drum.svelte';
	import DialLabels from './layers/DialLabels.svelte';
	import DialTickMark from './layers/DialTickMark.svelte';
	import DialTrackBorder from './layers/DialTrackBorder.svelte';
	import DialKnob from './layers/DialKnob.svelte';
	import { logger } from '$lib/services/logger';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';
	import { rotatable } from '$lib/components/dial/rotatable';
	import { doubleTappable } from '$lib/components/actions/doubleTappable';
	import { DialMarkerResolver } from './utils/dialMarkerResolver';

	const markerResolver = new DialMarkerResolver({
		minBpm: get(metronomeStore).minBpm,
		maxBpm: get(metronomeStore).maxBpm,
		minBpmAngle: 12,
		maxBpmAngle: 320
	});

	const initialAngle = markerResolver.calculateAngleFromBpm(get(metronomeStore).bpm);

	const rotationAngle = new Tween(initialAngle, {
		duration: 250,
		easing: quintOut
	});

	let currentRotation = $derived(rotationAngle.current);

	$effect(() => {
		const newBpm = markerResolver.calculateBpmFromDialRotation(currentRotation);
		if (Math.round(newBpm) !== $metronomeStore.bpm) {
			metronomeStore.setTempo(newBpm);
		}
	});

	$effect(() => {
		logger.log(`BPM updated to: ${$metronomeStore.bpm}`);
	});

	function snapToAngle(targetAngle: number) {
		const current = rotationAngle.current;
		const shortestPathAngle = markerResolver.calculateShortestRotation(targetAngle, current);
		rotationAngle.set(shortestPathAngle);
	}

	function snapToBpm(bpm: number) {
		const targetAngle = markerResolver.calculateAngleFromBpm(bpm);
		snapToAngle(targetAngle);
	}

	function handleRotate(event: CustomEvent<number>) {
		userInteractionStore.startInteraction();
		rotationAngle.set(event.detail, { duration: 0 });
	}

	function handleDragEnd() {
		userInteractionStore.endInteraction();
		snapToBpm($metronomeStore.bpm);
	}

	function handleDoubleTap(event: CustomEvent<{ angle: number }>) {
		logger.log(`Double tap detected at angle: ${event.detail.angle}`);
		const bpmAtTap = markerResolver.calculateBpmFromPositionalAngle(event.detail.angle, currentRotation);
		const targetBpm = Math.round(bpmAtTap / 5) * 5;
		logger.log(`Snapping to ~${targetBpm} BPM`);
		snapToBpm(targetBpm);
	}
</script>

<div
	class="dial-area-wrapper"
	role="slider"
	aria-label="Metronome tempo"
	aria-valuemin={get(metronomeStore).minBpm}
	aria-valuemax={get(metronomeStore).maxBpm}
	aria-valuenow={$metronomeStore.bpm}
	tabindex="-1"
	use:rotatable={{ rotation: currentRotation }}
	onrotate={handleRotate}
	ondragend={handleDragEnd}
	use:doubleTappable
	ondoubletap={handleDoubleTap}
>
	<div class="dial-container-outer">
		<div id="rotaryDialContainer" class="rotary-dial-container">
			<DialLabels rotationAngle={currentRotation} />
			<DialTickMark rotationAngle={currentRotation} />
			<DialTrackBorder divided={false} />
			<DialKnob />
			<Drum />
		</div>
	</div>
</div>

<style>
    .dial-area-wrapper {
        flex-grow: 1;
        min-height: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: grab;
        transition: min-height 0.35s ease-in-out;
        touch-action: none;
        user-select: none;
    }

    .dial-area-wrapper:active {
        cursor: grabbing;
    }

    .dial-container-outer {
        flex-shrink: 0;
        width: 300px;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .rotary-dial-container {
        position: relative;
        width: 250px;
        height: 250px;
        border-radius: 50%;
    }
</style>
