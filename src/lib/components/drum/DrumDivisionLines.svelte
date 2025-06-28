<!-- src/lib/components/drum/DrumDivisionLines.svelte -->

<script lang="ts">
	import { fade } from 'svelte/transition';

	let { divisions = 0 } = $props<{ divisions: number }>();
</script>

<div class="division-lines-container">
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
  $color-red: rgb(220, 53, 69);
  $color-green: rgb(40, 167, 69);
  $color-gray: rgb(108, 117, 125);

  .division-lines-container {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;

    --line-glow-color: #{rgba($color-green, 0.85)};

    &.on {
      --line-glow-color: #{rgba($color-red, 0.85)};
    }

    &.loading {
      --line-glow-color: #{rgba($color-gray, 0.7)};
    }
  }

  .division-line {
    position: absolute;
    width: 75%;
    height: 1px;
    top: 50%;
    left: 50%;
    transform-origin: 0 50%;
    transform: rotate(var(--rotation-angle));
    transition: background 0.3s ease;
    background: linear-gradient(to right, var(--line-glow-color, transparent), transparent);
  }
</style>