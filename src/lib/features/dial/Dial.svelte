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

	function handleToggle() {
		console.log('Metronome on toggle');
		isRunning = !isRunning;
	}

    /**
     * @param {MouseEvent | TouchEvent} event - Sự kiện chuột hoặc cảm ứng.
     */
    function handleDragStart(event) {
        console.log('Drag started on Dial');
    }
</script>

<div
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