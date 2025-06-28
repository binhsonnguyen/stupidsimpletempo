<!-- src/lib/components/dial/layers/BezelDividers.svelte -->

<script lang="ts">
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { fade } from 'svelte/transition';

	const BEAT_INTERVAL_TO_DIVISIONS: Record<string, number> = {
		'1m': 0,
		'2n': 2,
		'4n': 4,
		'8n': 8,
		'16n': 16,
		'8t': 12
	};

	const divisions = $derived(
		BEAT_INTERVAL_TO_DIVISIONS[$metronomeStore.timeSignature.beatInterval] ?? 0
	);
</script>

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

<style lang="scss">
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