<script>
    export let rotationAngle = 0
</script>

<div
        id="labelLayer"
        class="dial-layer"
        style="transform: rotate({rotationAngle}deg);"
></div>

<style>
    @import '../styles/_dial-layer-base.scss';

    #labelLayer {
        z-index: 1;
        background-image: url('/svg/bpm-labels.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>