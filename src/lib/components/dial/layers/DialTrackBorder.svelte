<!-- src/lib/components/dial/layers/DialTrackBorder.svelte -->

<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { fade } from 'svelte/transition';
	import { drumGlowStore } from '$lib/state/drumGlowStore';

	const TINT_INTENSITY_FACTOR = 0.3;

	const finalTintIntensity = $derived($drumGlowStore.baseIntensity * TINT_INTENSITY_FACTOR);

	const BEAT_INTERVAL_TO_DIVISIONS: Record<string, number> = {
		'1m': 0, // Không chia cho nốt tròn
		'2n': 2,
		'4n': 4,
		'8n': 8,
		'16n': 16,
		'8t': 12 // Nhịp 3 có thể được coi là 12 vạch (4 phách x 3)
	};

	const divisions = $derived(
		BEAT_INTERVAL_TO_DIVISIONS[$metronomeStore.timeSignature.beatInterval] ?? 0
	);
</script>

<div
	id="dialTrackBorderLayer"
	class="dial-layer"
	style="--glow-rgb: {$drumGlowStore.rgb}; --tint-intensity: {finalTintIntensity};"
>
	{#if divisions > 1}
		<div class="bezel-dividers">
			<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
			{#each Array(divisions) as _, i (i)}
				{@const angle = (i / divisions) * 360}
				<div
					class="bezel-divider-line"
					style="--rotation-angle: {angle}deg;"
					transition:fade={{ duration: 200 }}
				></div>
			{/each}
		</div>
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

  .bezel-dividers {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .bezel-divider-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: calc(100% + 10px);
    background-color: #212529;
    transform-origin: center;
    transform: translate(-50%, -50%) rotate(var(--rotation-angle));
  }
</style>