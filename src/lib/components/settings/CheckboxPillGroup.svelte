<!-- src/lib/components/settings/CheckboxPillGroup.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CheckboxPill from './CheckboxPill.svelte';

	type Option = {
		value: string;
		label: string;
	};

	let {
		name,
		options,
		selectedValues = []
	} = $props<{
		name: string;
		options: Option[];
		selectedValues: string[];
	}>();

	const dispatch = createEventDispatcher<{
		change: { value: string; checked: boolean };
	}>();
</script>

<div class="pills-container">
	{#each options as option (option.value)}
		<CheckboxPill
			id={`${name}-${option.value}`}
			{name}
			value={option.value}
			label={option.label}
			checked={selectedValues.includes(option.value)}
			on:change={(e) => dispatch('change', { value: option.value, checked: e.currentTarget.checked })}
		/>
	{/each}
</div>

<style lang="scss">
  .pills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>