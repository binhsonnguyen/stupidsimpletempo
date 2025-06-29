<!-- src/lib/components/drum/DrumDivisionLines.svelte -->

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { glowStore } from '$lib/state/glowStore';

	let { divisions = 0 } = $props<{ divisions: number }>();

	const TINT_INTENSITY_FACTOR = 1;
	const tintIntensity = $derived($glowStore.baseIntensity * TINT_INTENSITY_FACTOR);
</script>

<div
	class="division-lines-container"
	style="--glow-rgb: {$glowStore.rgb}; --tint-intensity: {tintIntensity};"
>
	{#if divisions > 1}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
		{#each Array(divisions) as _, i (i)}
			{@const angleOffset = -90}
			{@const angle = (i / divisions) * 360 + angleOffset}
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

    $base-color: #6c757d;
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