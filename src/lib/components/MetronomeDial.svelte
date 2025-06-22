<!-- src/lib/components/MetronomeDial.svelte -->
<script>
    import Drum from './Drum.svelte';

    let isRunning = false

    function handleToggle() {
        console.log('Metronome on toggle');
    }
</script>

<div class="dial-area-wrapper">
    <div class="dial-container-outer">
        <div id="rotaryDialContainer" class="rotary-dial-container">
            <!-- Các layer để vẽ mặt đồng hồ -->
            <div id="labelLayer" class="dial-layer"></div>
            <div id="tickMarkLayer" class="dial-layer"></div>
            <div id="dialTrackBorderLayer" class="dial-layer dial-track-visual-border"></div>

            <!-- Núm xoay để điều chỉnh BPM -->
            <div id="rotaryKnob" class="rotary-knob"></div>

            <!--
              Mặt trống.
            -->
            <Drum isRunning={isRunning} onToggle={handleToggle} />
        </div>
    </div>
</div>

<style>
</style>