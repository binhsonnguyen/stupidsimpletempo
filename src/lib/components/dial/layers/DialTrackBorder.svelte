<!-- src/lib/components/dial/layers/DialTrackBorder.svelte -->

<script lang="ts">
	import { drumGlowStore } from '$lib/state/drumGlowStore';
	import { GLOW_SPREAD_PULSE_MAX } from '$lib/config/chromaConstants';

	const DISTANCE_DAMPENING_FACTOR = 0.4;

	let finalTintIntensity = $state(0);

	$effect(() => {
		const glow = $drumGlowStore;

		const spreadFactor =
			GLOW_SPREAD_PULSE_MAX > 0 ? glow.spread / GLOW_SPREAD_PULSE_MAX : 0;

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