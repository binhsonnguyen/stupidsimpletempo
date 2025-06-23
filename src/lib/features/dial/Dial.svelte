<!-- src/lib/features/dial/Dial.svelte -->

<script lang="ts">
	import Drum from '$lib/features/drum/Drum.svelte';
	import DialLabels from './DialLabels.svelte';
	import DialTickMark from './DialTickMark.svelte';
	import DialTrackBorder from './DialTrackBorder.svelte';
	import DialKnob from './DialKnob.svelte';
	import { logger } from '$lib/services/logger';

	type DragState = {
		startAngle: number;
		startRotationAngle: number;
	};

	const dialSettings = { maxBpm: 200, minBpm: 40 };

	let dialElement: HTMLElement | undefined;
	let dragState: DragState | null = null;

	let rotationAngle = 0;
	let currentBpm = dialSettings.minBpm;
	let isRunning = false;

	$: {
		const knobAngle = -rotationAngle;
		const effectiveAngle = ((knobAngle % 360) + 360) % 360;
		const bpmRange = dialSettings.maxBpm - dialSettings.minBpm;
		const calculatedBpm = (effectiveAngle / 360) * bpmRange + dialSettings.minBpm;
		currentBpm = Math.round(calculatedBpm);
		logger.log(`Angle: ${rotationAngle.toFixed(1)} -> Normalized: ${effectiveAngle.toFixed(1)} -> BPM: ${currentBpm}`);
	}

	/**
	 * Trả về tọa độ (x, y) từ MouseEvent hoặc TouchEvent.
	 */
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
		isRunning = !isRunning;
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
	aria-valuemin={dialSettings.minBpm}
	aria-valuemax={dialSettings.maxBpm}
	aria-valuenow={currentBpm}
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
			<Drum {isRunning} onToggle={handleToggle} />
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
        touch-action: none; /* Prevents default touch behaviors */
        user-select: none; /* Prevents text selection during drag */
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