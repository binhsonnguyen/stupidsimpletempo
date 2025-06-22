<!-- src/lib/components/Dial.svelte -->

<script>
    import Drum from './Drum.svelte';
    import DialLabels from '$lib/components/DialLabels.svelte';
    import DialTickMark from '$lib/components/DialTickMark.svelte';
    import DialTrackBorder from '$lib/components/DialTrackBorder.svelte';
    import DialKnob from '$lib/components/DialKnob.svelte';

    let isRunning = false;
    let rotationAngle = 0;

    const minBpm = 40;
    const maxBpm = 200;
    let currentBpm = 40;

    function handleToggle() {
        console.log('Metronome on toggle');
        isRunning = !isRunning;
    }

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