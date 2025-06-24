<!-- src/lib/features/dial/Dial.svelte -->

<script lang="ts">
	import { get } from 'svelte/store';
	import Drum from '$lib/features/drum/Drum.svelte';
	import DialLabels from './DialLabels.svelte';
	import DialTickMark from './DialTickMark.svelte';
	import DialTrackBorder from './DialTrackBorder.svelte';
	import DialKnob from './DialKnob.svelte';
	import { logger } from '$lib/services/logger';
	import { metronomeStore } from '$lib/state/metronomeStore';

	type DragState = {
		startAngle: number;
		startRotationAngle: number;
	};

	let dialElement: HTMLElement | undefined;
	let dragState: DragState | null = null;
	let rotationAngle = 0;

	const { minBpm, maxBpm, minBpmAngle, maxBpmAngle } = {
		minBpm: get(metronomeStore).minBpm,
		maxBpm: get(metronomeStore).maxBpm,
		minBpmAngle: 12,
		maxBpmAngle: 320
	};

	$: {
		const newBpm = calculateBpmFromAngle(rotationAngle);
		if (Math.round(newBpm) !== $metronomeStore.bpm) {
			metronomeStore.setTempo(newBpm);
		}
	}

	$: {
		logger.log(`BPM updated to: ${$metronomeStore.bpm}`);
	}

	/*
	 * Kẹp một giá trị luôn trong một khoảng min-max
	 */
	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

	/*
	 * Tính bpm từ góc quay của dial
	 */
	function calculateBpmFromAngle(currentRotationAngle: number): number {
		const knobAngle = -currentRotationAngle;
		const effectiveAngle = ((knobAngle % 360) + 360) % 360;
		const clampedAngle = clamp(effectiveAngle, minBpmAngle, maxBpmAngle);

		const usableAngleRange = maxBpmAngle - minBpmAngle;
		const angleWithinUsableRange = clampedAngle - minBpmAngle;
		const percentage = usableAngleRange > 0 ? angleWithinUsableRange / usableAngleRange : 0;

		const bpmRange = maxBpm - minBpm;
		return minBpm + percentage * bpmRange;
	}

	function getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
		if ('touches' in event) {
			return { x: event.touches[0].clientX, y: event.touches[0].clientY };
		}
		return { x: event.clientX, y: event.clientY };
	}

	/**
	 * Tính góc của một điểm so với tâm của một phần tử
	 */
	function getAngle(element: HTMLElement, clientX: number, clientY: number): number {
		const rect = element.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const dx = clientX - centerX;
		const dy = clientY - centerY;
		return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
	}

	function handleToggle() {
		metronomeStore.toggle();
	}

	function handleDragStart(event: MouseEvent | TouchEvent) {
		if (!dialElement) return;
		event.preventDefault();
		if ((event.target as Element).closest('.start-stop-button')) {
			return;
		}

		const { x, y } = getEventCoordinates(event);
		dragState = {
			startRotationAngle: rotationAngle,
			startAngle: getAngle(dialElement, x, y)
		};

		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
		window.addEventListener('touchmove', handleDragMove, { passive: false });
		window.addEventListener('touchend', handleDragEnd);
		window.addEventListener('touchcancel', handleDragEnd);
	}

	function handleDragMove(event: MouseEvent | TouchEvent) {
		if (!dragState || !dialElement) return;
		event.preventDefault();

		const { x, y } = getEventCoordinates(event);
		const currentAngle = getAngle(dialElement, x, y);
		let deltaAngle = currentAngle - dragState.startAngle;

		if (deltaAngle > 180) deltaAngle -= 360;
		else if (deltaAngle < -180) deltaAngle += 360;

		rotationAngle = dragState.startRotationAngle + deltaAngle;
	}

	function handleDragEnd() {
		if (dragState) {
			dragState = null;
			window.removeEventListener('mousemove', handleDragMove);
			window.removeEventListener('mouseup', handleDragEnd);
			window.removeEventListener('touchmove', handleDragMove);
			window.removeEventListener('touchend', handleDragEnd);
			window.removeEventListener('touchcancel', handleDragEnd);
		}
	}
</script>

<div
	bind:this={dialElement}
	class="dial-area-wrapper"
	role="slider"
	aria-label="Metronome tempo"
	aria-valuemin={minBpm}
	aria-valuemax={maxBpm}
	aria-valuenow={$metronomeStore.bpm}
	tabindex="-1"
	on:mousedown={handleDragStart}
	on:touchstart={handleDragStart}
>
	<div class="dial-container-outer">
		<div id="rotaryDialContainer" class="rotary-dial-container">
			<DialLabels {rotationAngle} />
			<DialTickMark {rotationAngle} />
			<DialTrackBorder />
			<DialKnob />
			<Drum isRunning={$metronomeStore.isRunning} onToggle={handleToggle} />
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