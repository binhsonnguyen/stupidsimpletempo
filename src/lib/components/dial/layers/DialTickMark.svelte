<!-- src/lib/components/dial/layers/DialTickMark.svelte -->

<script lang="ts">
	let { rotationAngle = 0 } = $props();

	import { drumGlowStore } from '$lib/state/drumGlowStore';
	const TINT_INTENSITY_FACTOR = 0.8;
	const finalTintIntensity = $derived(
		$drumGlowStore.baseIntensity * TINT_INTENSITY_FACTOR
	);
</script>

<div
	id="tickMarkLayer"
	class="dial-layer"
	style="transform: rotate({rotationAngle}deg);
	       --glow-rgb: {$drumGlowStore.rgb};
	       --tint-intensity: {finalTintIntensity};"
></div>

<style lang="scss">
  @use '../_dial-layer-base.scss';

  #tickMarkLayer {
    z-index: 2;

    mask-image: url('/svg/bpm-markers.svg');
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;

    $base-color: #6c757d;

    background-color: color-mix(
                    in srgb,
                    rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%),
                    $base-color
    );

    transition: background-color 0.1s ease-out;
  }
</style>