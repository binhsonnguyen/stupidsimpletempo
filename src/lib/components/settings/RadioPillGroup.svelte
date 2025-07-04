<!-- src/lib/components/settings/RadioPillGroup.svelte -->

<script lang="ts">
	import RadioPill from './RadioPill.svelte';

	type Option = { value: string; label: string };

	let {
		name,
		options,
		selectedValue,
		onchange
	} = $props<{
		name: string;
		options: Option[];
		selectedValue: string;
		onchange?: (value: string) => void;
	}>();

	function handlePillChange(event: Event) {
		if (!onchange) return;
		const target = event.currentTarget as HTMLInputElement;
		onchange(target.value);
	}
</script>

<div class="pill-group">
	{#each options as option (option.value)}
		<RadioPill
			id={`${name}-${option.value}`}
			{name}
			value={option.value}
			label={option.label}
			checked={selectedValue === option.value}
			onchange={handlePillChange}
		/>
	{/each}
</div>

<style>
    .pill-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
</style>