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
	import { rotatable } from '$lib/components/actions/rotatable';
	import { doubleTappable } from '$lib/components/actions/doubleTappable';
	import { DialBpmResolver } from './utils/dialBpmResolver';

	const rotationAngle = new Tween(0, {
		duration: 250,
		easing: quintOut
	});

	let currentAngle = $derived(rotationAngle.current);

	const bpmResolver = new DialBpmResolver({
		minBpm: get(metronomeStore).minBpm,
		maxBpm: get(metronomeStore).maxBpm,
		minBpmAngle: 12,
		maxBpmAngle: 320
	});

	$effect(() => {
		const newBpm = bpmResolver.calculateBpmFromAngle(currentAngle);
		if (Math.round(newBpm) !== $metronomeStore.bpm) {
			metronomeStore.setTempo(newBpm);
		}
	});

	$effect(() => {
		logger.log(`BPM updated to: ${$metronomeStore.bpm}`);
	});

	function calculateShortestRotation(targetAngle: number, currentAngle: number): number {
		let finalAngle = targetAngle;
		const delta = finalAngle - currentAngle;

		if (delta > 180) {
			finalAngle -= 360;
		} else if (delta < -180) {
			finalAngle += 360;
		}
		return finalAngle;
	}

	function snapToAngle(targetAngle: number) {
		const current = rotationAngle.current;
		const shortestPathAngle = calculateShortestRotation(targetAngle, current);
		rotationAngle.set(shortestPathAngle);
	}

	function snapToBpm(bpm: number) {
		const targetAngle = bpmResolver.calculateAngleFromBpm(bpm);
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
		const bpmAtTap = bpmResolver.calculateBpmFromPositionalAngle(event.detail.angle);
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
	use:rotatable={{ rotation: currentAngle }}
	onrotate={handleRotate}
	ondragend={handleDragEnd}
	use:doubleTappable
	ondoubletap={handleDoubleTap}
>
	<div class="dial-container-outer">
		<div id="rotaryDialContainer" class="rotary-dial-container">
			<DialLabels rotationAngle={currentAngle} />
			<DialTickMark rotationAngle={currentAngle} />
			<DialTrackBorder />
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
