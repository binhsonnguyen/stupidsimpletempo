<script>
    export let rotationAngle = 0
</script>

<div
        id="tickMarkLayer"
        class="dial-layer"
        style="transform: rotate({rotationAngle}deg);"
></div>

<style>
    @import '../styles/_dial-layer-base.scss';

    #tickMarkLayer {
        z-index: 2;
        background-image: url('/svg/bpm-markers.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>