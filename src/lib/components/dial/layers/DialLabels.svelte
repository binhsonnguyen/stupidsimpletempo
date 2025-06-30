<!-- src/lib/components/dial/layers/DialLabels.svelte -->

<script lang="ts">
	let { rotationAngle = 0 } = $props();

	import { dialGlowStore } from '$lib/state/chromaStore';

	const TINT_INTENSITY_FACTOR = 0.9;

	const finalTintIntensity = $derived(
		$dialGlowStore.baseIntensity * TINT_INTENSITY_FACTOR
	);
</script>

<div
	id="labelLayer"
	class="dial-layer"
	style="transform: rotate({rotationAngle}deg);
	       --glow-rgb: {$dialGlowStore.rgb};
	       --tint-intensity: {finalTintIntensity};"
></div>

<style lang="scss">
  @use '../_dial-layer-base.scss';
  @use '$lib/styles/variables';

  #labelLayer {
    z-index: 2;

    mask-image: url('/svg/bpm-labels.svg');
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;

    background-color: color-mix(
                    in srgb,
                    rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%),
                    variables.$base-forefront
    );

    transition: background-color 0.1s ease-out;
  }
</style>