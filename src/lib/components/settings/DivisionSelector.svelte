<!-- src/lib/components/settings/DivisionSelector.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { VALID_DIVISIONS, type Division } from '$lib/constants';
	import CheckboxPill from './CheckboxPill.svelte';

	const enabledDivisions = $derived($settingsStore.enabledDivisions ?? []);

	function handleDivisionToggle(division: Division, isChecked: boolean) {
		let newEnabled: Division[];

		if (isChecked) {
			newEnabled = [...enabledDivisions, division];
		} else {
			newEnabled = enabledDivisions.filter((d) => d !== division);
		}

		settingsStore.setEnabledDivisions(newEnabled);
	}
</script>

<div class="setting-item">
	<div class="setting-label">Enabled Beat Divisions</div>
	<div class="division-grid">
		{#each VALID_DIVISIONS as division}
			<CheckboxPill
				id={`division-${division}`}
				name="enabled_divisions"
				value={division.toString()}
				label={division.toString()}
				checked={enabledDivisions.includes(division)}
				on:change={(e) => handleDivisionToggle(division, e.currentTarget.checked)}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
  .division-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>