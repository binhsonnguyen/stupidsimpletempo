<!-- src/lib/components/settings/DivisionSelector.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { VALID_DIVISIONS, type Division } from '$lib/constants';
	import CheckboxPillGroup from './CheckboxPillGroup.svelte';

	const enabledDivisions = $derived($settingsStore.enabledDivisions ?? []);

	const divisionOptions = VALID_DIVISIONS.map((d) => ({
		value: d.toString(),
		label: d.toString()
	}));

	function handleSelectionChange(event: CustomEvent<{ value: string; checked: boolean }>) {
		const { value, checked } = event.detail;
		const division = Number(value) as Division;

		let newEnabled: Division[];

		if (checked) {
			newEnabled = [...enabledDivisions, division];
		} else {
			newEnabled = enabledDivisions.filter((d) => d !== division);
		}

		settingsStore.setEnabledDivisions(newEnabled);
	}
</script>

<div class="setting-item">
	<div class="setting-label">Beats Per Measure</div>

	<CheckboxPillGroup
		name="enabled_divisions"
		options={divisionOptions}
		selectedValues={enabledDivisions.map(String)}
		on:change={handleSelectionChange}
	/>
</div>
