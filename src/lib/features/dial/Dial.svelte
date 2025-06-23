<!-- src/lib/features/dial/Dial.svelte -->

<script lang="ts">
	import Drum from '$lib/features/drum/Drum.svelte';
	import DialLabels from './DialLabels.svelte';
	import DialTickMark from './DialTickMark.svelte';
	import DialTrackBorder from './DialTrackBorder.svelte';
	import DialKnob from './DialKnob.svelte';
	import { logger } from '$lib/services/logger';

	let isRunning = false;
	let rotationAngle = 0;

	const minBpm = 40;
	const maxBpm = 200;
	let currentBpm = 40;

	let isDragging = false;
	let startAngle = 0;
	let startRotationAngle = 0;
	let dialElement: HTMLElement | undefined;

	function handleToggle() {
		console.log('Metronome on toggle');
		isRunning = !isRunning;
	}

	/**
	 * Calculates the angle of a point relative to the center of an element.
	 */
	function getAngle(element: HTMLElement, clientX: number, clientY: number): number {
		const rect = element.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const dx = clientX - centerX;
		const dy = clientY - centerY;

		// Converts radians to degrees and adjusts so 0 is at the 12 o'clock position.
		return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
	}

	/**
	 * Starts the drag interaction when the user clicks or touches the dial.
	 */
	function handleDragStart(event: MouseEvent | TouchEvent) {
		if (!dialElement) return;

		event.preventDefault();

		if ((event.target as Element).closest('.start-stop-button')) {
			return;
		}

		isDragging = true;
		startRotationAngle = rotationAngle;

		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		// No need for a type assertion here because of the guard clause above.
		startAngle = getAngle(dialElement, clientX, clientY);

		logger.log('Dial drag start with startAngle ', startAngle)

		// Add global event listeners to track the drag
		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
		window.addEventListener('touchmove', handleDragMove, { passive: false });
		window.addEventListener('touchend', handleDragEnd);
		window.addEventListener('touchcancel', handleDragEnd);
	}

	/**
	 * Handles the movement during a drag interaction.
	 */
	function handleDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging || !dialElement) return;

		event.preventDefault();

		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		const currentAngle = getAngle(dialElement, clientX, clientY);
		let deltaAngle = currentAngle - startAngle;

		// Handle the 0/360 degree crossover for smoother rotation
		if (deltaAngle > 180) {
			deltaAngle -= 360;
		} else if (deltaAngle < -180) {
			deltaAngle += 360;
		}

		rotationAngle = startRotationAngle + deltaAngle;

		logger.log('Dial drag moving ', rotationAngle)
	}

	/**
	 * Ends the drag interaction.
	 */
	function handleDragEnd() {
		isDragging = false;

		// Clean up global listeners
		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
		window.removeEventListener('touchmove', handleDragMove);
		window.removeEventListener('touchend', handleDragEnd);
		window.removeEventListener('touchcancel', handleDragEnd);
	}
</script>

<div
	bind:this={dialElement}
	class="dial-area-wrapper"
	role="slider"
	aria-label="Metronome tempo"
	aria-valuemin={minBpm}
	aria-valuemax={maxBpm}
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