<!-- src/lib/components/dial/Dial.svelte -->

<script lang="ts">
	import { get } from 'svelte/store';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';

	import Drum from '$lib/components/drum/Drum.svelte';
	import DialLabels from './layers/DialLabels.svelte';
	import DialTickMark from './layers/DialTickMark.svelte';
	import DialTrackBorder from './layers/DialTrackBorder.svelte';
	import DialKnob from './layers/DialKnob.svelte';
	import { logger } from '$lib/services/logger';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { rotatable } from '$lib/components/dial/actions/rotatable';

	const rotationAngle = tweened(0, {
		duration: 250,
		easing: quintOut
	});

	const { minBpm, maxBpm, minBpmAngle, maxBpmAngle } = {
		minBpm: get(metronomeStore).minBpm,
		maxBpm: get(metronomeStore).maxBpm,
		minBpmAngle: 12,
		maxBpmAngle: 320
	};

	$: {
		const newBpm = calculateBpmFromAngle($rotationAngle);
		if (Math.round(newBpm) !== $metronomeStore.bpm) {
			metronomeStore.setTempo(newBpm);
		}
	}

	$: logger.log(`BPM updated to: ${$metronomeStore.bpm}`);

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

	function calculateBpmFromAngle(angle: number): number {
		const knobAngle = -angle;
		const effectiveAngle = ((knobAngle % 360) + 360) % 360;
		const clampedAngle = clamp(effectiveAngle, minBpmAngle, maxBpmAngle);

		const usableAngleRange = maxBpmAngle - minBpmAngle;
		const angleWithinUsableRange = clampedAngle - minBpmAngle;
		const percentage = usableAngleRange > 0 ? angleWithinUsableRange / usableAngleRange : 0;

		const bpmRange = maxBpm - minBpm;
		return minBpm + percentage * bpmRange;
	}

	function calculateAngleFromBpm(bpm: number): number {
		const bpmRange = maxBpm - minBpm;
		const percentage = bpmRange > 0 ? (bpm - minBpm) / bpmRange : 0;

		const usableAngleRange = maxBpmAngle - minBpmAngle;
		const angle = minBpmAngle + percentage * usableAngleRange;

		return -angle;
	}

	function handleRotate(event: CustomEvent<number>) {
		rotationAngle.set(event.detail, { duration: 0 });
	}

	function handleDragEnd() {
		const finalBpm = $metronomeStore.bpm;
		const targetAngle = calculateAngleFromBpm(finalBpm);
		rotationAngle.set(targetAngle);
	}

	rotationAngle.set(calculateAngleFromBpm($metronomeStore.bpm), { duration: 0 });
</script>

<div
	class="dial-area-wrapper"
	role="slider"
	aria-label="Metronome tempo"
	aria-valuemin={minBpm}
	aria-valuemax={maxBpm}
	aria-valuenow={$metronomeStore.bpm}
	tabindex="-1"
	use:rotatable={{ rotation: $rotationAngle }}
	on:rotate={handleRotate}
	on:dragend={handleDragEnd}
>
	<div class="dial-container-outer">
		<div id="rotaryDialContainer" class="rotary-dial-container">
			<DialLabels rotationAngle={$rotationAngle} />
			<DialTickMark rotationAngle={$rotationAngle} />
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
