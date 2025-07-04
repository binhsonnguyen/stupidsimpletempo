<!-- src/lib/components/settings/CheckboxPillGroup.svelte -->
<script lang="ts">
	import CheckboxPill from './CheckboxPill.svelte';

	type Option = { value: string; label: string };

	let {
		name,
		options,
		selectedValues = [],
		onchange
	} = $props<{
		name: string;
		options: Option[];
		selectedValues?: string[];
		onchange?: (detail: { value: string; checked: boolean }) => void;
	}>();

	function handlePillChange(event: Event) {
		if (!onchange) return;
		const target = event.currentTarget as HTMLInputElement;
		onchange({ value: target.value, checked: target.checked });
	}
</script>

<div class="pill-group">
	{#each options as option (option.value)}
		<CheckboxPill
			id={`${name}-${option.value}`}
			{name}
			value={option.value}
			label={option.label}
			checked={selectedValues.includes(option.value)}
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