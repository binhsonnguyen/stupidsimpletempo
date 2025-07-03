<!-- src/lib/components/settings/RadioPillGroup.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import RadioPill from './RadioPill.svelte';

	type Option = {
		value: string;
		label: string;
	};

	export let name: string;
	export let options: Option[];
	export let selectedValue: string;

	const dispatch = createEventDispatcher<{ change: string }>();
</script>

<div class="radio-options-container">
	{#each options as option (option.value)}
		<RadioPill
			id="{name}-{option.value}"
			{name}
			value={option.value}
			checked={selectedValue === option.value}
			label={option.label}
			on:change={(e) => dispatch('change', e.detail)}
		/>
	{/each}
</div>

<style lang="scss">
  .radio-options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>