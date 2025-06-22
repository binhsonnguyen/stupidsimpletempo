<script>
</script>
<!-- Núm xoay tĩnh, luôn ở vị trí 12 giờ -->
<div id="rotaryKnob" class="rotary-knob"></div>

<style>
    .rotary-knob {
        position: absolute;
        width: 0;
        height: 0;
        border-left: 7.5px solid transparent;
        border-right: 7.5px solid transparent;
        border-top: 13px solid #ff0000;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 4;
    }
</style>