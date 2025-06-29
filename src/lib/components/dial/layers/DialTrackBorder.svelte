<!-- src/lib/components/dial/layers/DialTrackBorder.svelte -->

<script lang="ts">
	import { chromaStore } from '$lib/state/chromaStore';
	import BezelDividers from './BezelDividers.svelte';

	let { divided = false } = $props<{ divided?: boolean }>();

	const TINT_INTENSITY_FACTOR = 0.3;

	const finalTintIntensity = $derived($chromaStore.baseIntensity * TINT_INTENSITY_FACTOR);
</script>

<div
	id="dialTrackBorderLayer"
	class="dial-layer"
	style="--glow-rgb: {$chromaStore.rgb}; --tint-intensity: {finalTintIntensity};"
>
	{#if divided}
		<BezelDividers />
	{/if}
</div>

<style lang="scss">
  @use '../_dial-layer-base.scss';

  #dialTrackBorderLayer {
    z-index: 1;
    box-sizing: border-box;
    border-width: 5px;
    border-style: solid;
    position: relative;

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
