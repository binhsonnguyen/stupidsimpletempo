<!-- src/lib/components/Dial.svelte -->
<script>
    import Drum from './Drum.svelte';

    let isRunning = false

    function handleToggle() {
        console.log('Metronome on toggle');
        isRunning = !isRunning;
    }
</script>

<div class="dial-area-wrapper">
    <div class="dial-container-outer">
        <div id="rotaryDialContainer" class="rotary-dial-container">
            <!-- Mặt tròn -->
            <div id="labelLayer" class="dial-layer"></div>
            <div id="tickMarkLayer" class="dial-layer"></div>
            <div id="dialTrackBorderLayer" class="dial-layer"></div>

            <!-- Núm xoay để nhìn BPM -->
            <div id="rotaryKnob" class="rotary-knob"></div>

            <!-- Mặt trống -->
            <Drum {isRunning} onToggle={handleToggle} />
        </div>
    </div>
</div>

<style>
    .dial-area-wrapper {
        flex-grow: 1; /* Luôn lấp đầy không gian còn lại */
        min-height: 0; /* Cho phép co lại nhỏ hơn nội dung, rất quan trọng cho flexbox */
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: grab;
        transition: min-height 0.35s ease-in-out;
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
        cursor: grab;
        border-radius: 50%;
    }

    .dial-layer {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: 50%;
        pointer-events: none;
    }

    #labelLayer {
        z-index: 1;
        background-image: url('/svg/bpm-labels.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    #tickMarkLayer {
        z-index: 2;
        background-image: url('/svg/bpm-markers.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    #dialTrackBorderLayer {
        z-index: 3;
        border: 5px solid #495057;
        box-sizing: border-box;
    }

    .rotary-knob {
        position: absolute;
        width: 0;
        height: 0;
        border-left: 7.5px solid transparent;
        border-right: 7.5px solid transparent;
        border-top: 13px solid #FF0000;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 4;
    }
</style>