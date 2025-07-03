<!-- src/lib/components/icons/Icon.svelte -->

<script lang="ts">
	let { name, class: className = '' } = $props<{ name: string; class?: string }>();

	const iconModule = import(`$lib/assets/icons/${name}.svg?raw`);
</script>

{#await iconModule then { default: svgContent }}
	<div class="icon-wrapper {className}" aria-hidden="true">
		<!--eslint-disable-next-line svelte/no-at-html-tags-->
		{@html svgContent}
	</div>
{/await}

<style lang="scss">
  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon-wrapper :global(svg) {
    width: 1em;
    height: 1em;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>