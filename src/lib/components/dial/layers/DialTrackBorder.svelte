<!-- src/lib/components/dial/layers/DialTrackBorder.svelte -->

<script lang="ts">
	import { drumGlowStore } from '$lib/state/drumGlowStore';
	import { GLOW_SPREAD_PULSE_MAX } from '$lib/config/chromaConstants';

	const DISTANCE_DAMPENING_FACTOR = 0.1; // Giả lập "khoảng cách" tới drum
	const SPREAD_OFFSET = 1; // "Số bù spread" để đảm bảo kể cả khi spread = 0, vẫn có cường độ cơ bản

	let finalTintIntensity = $state(0);

	$effect(() => {
		const glow = $drumGlowStore;

		const adjustedSpread = glow.spread + SPREAD_OFFSET;
		const adjustedMaxSpread = GLOW_SPREAD_PULSE_MAX + SPREAD_OFFSET;

		const spreadFactor = adjustedMaxSpread > 0 ? adjustedSpread / adjustedMaxSpread : 0;

		const calculatedIntensity = Math.max(
			0,
			Math.min(1, spreadFactor * glow.alpha * DISTANCE_DAMPENING_FACTOR)
		);

		finalTintIntensity = calculatedIntensity;
	});
</script>

<div
	id="dialTrackBorderLayer"
	class="dial-layer"
	style="--glow-rgb: {$drumGlowStore.rgb}; --tint-intensity: {finalTintIntensity};"
></div>

<style lang="scss">
  @use '../_dial-layer-base.scss';

  #dialTrackBorderLayer {
    z-index: 3;
    box-sizing: border-box;
    border-width: 5px;
    border-style: solid;

    $base-color: #495057;

    border-color: color-mix(
                    in srgb,
                    rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%),
                    $base-color
    );
    box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.3);
    transition: border-color 0.1s ease-out;
  }
</style>