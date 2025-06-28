<!-- src/lib/components/dial/layers/DialLabels.svelte -->

<script lang="ts">
	let { rotationAngle = 0 } = $props();

	import { drumGlowStore } from '$lib/state/drumGlowStore';

	const TINT_INTENSITY_FACTOR = 0.9;

	const finalTintIntensity = $derived(
		$drumGlowStore.baseIntensity * TINT_INTENSITY_FACTOR
	);
</script>

<div
	id="labelLayer"
	class="dial-layer"
	style="transform: rotate({rotationAngle}deg);
	       --glow-rgb: {$drumGlowStore.rgb};
	       --tint-intensity: {finalTintIntensity};"
></div>

<style lang="scss">
  @use '../_dial-layer-base.scss';

  #labelLayer {
    z-index: 2;

    // 3. Thay đổi từ background-image sang mask-image
    mask-image: url('/svg/bpm-labels.svg');
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;

    // 4. Dùng color-mix để tô màu cho các nhãn
    $base-color: #6c757d; // Màu nền của nhãn khi không bị ảnh hưởng

    background-color: color-mix(
                    in srgb,
                    rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%),
                    $base-color
    );

    transition: background-color 0.1s ease-out;
  }
</style>