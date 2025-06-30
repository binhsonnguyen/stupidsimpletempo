<!-- src/lib/components/drum/DrumDivisionLines.svelte -->

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { drumGlowStore } from '$lib/state/chromaStore';

	let { divisions = 0 } = $props<{ divisions: number }>();

	const TINT_INTENSITY_FACTOR = 1;
	const tintIntensity = $derived($drumGlowStore.baseIntensity * TINT_INTENSITY_FACTOR);
</script>

<div
	class="division-lines-container"
	style="--glow-rgb: {$drumGlowStore.rgb}; --tint-intensity: {tintIntensity};"
>
	{#if divisions > 1}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
		{#each Array(divisions) as _, i (i)}
			{@const baseAngleOffset = -90}
			{@const conditionalOffset = divisions === 2 ? 90 : 0}
			{@const angle = (i / divisions) * 360 + baseAngleOffset + conditionalOffset}
			<div
				class="division-line"
				style="--rotation-angle: {angle}deg;"
				transition:fade={{ duration: 150 }}
			></div>
		{/each}
	{/if}
</div>

<style lang="scss">
  .division-lines-container {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .division-line {
    position: absolute;
    width: 75%;
    height: 1px;
    top: 50%;
    left: 50%;
    transform-origin: 0 50%;
    transform: rotate(var(--rotation-angle));
    transition: background 0.1s ease;

    $base-color: #8b9196;
    background: linear-gradient(
                    to right,
                    color-mix(
                                    in srgb,
                                    rgba(var(--glow-rgb), 1) calc(var(--tint-intensity) * 100%),
                                    $base-color
                    ),
                    transparent
    );
  }
</style>