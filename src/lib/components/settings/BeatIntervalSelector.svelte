<!-- src/lib/components/settings/BeatIntervalSelector.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { VALID_BEAT_INTERVALS, type BeatInterval } from '$lib/constants';
	import CheckboxPillGroup from './CheckboxPillGroup.svelte';
	import { BEAT_INTERVAL_TO_FRACTION_DENOMINATOR } from '$lib/models/timeSignature';

	const enabledIntervals = $derived($settingsStore.enabledBeatIntervals ?? []);

	const intervalOptions = VALID_BEAT_INTERVALS.map((interval) => ({
		value: interval,
		label: BEAT_INTERVAL_TO_FRACTION_DENOMINATOR[interval]
	}));

	function handleSelectionChange(detail: { value: string; checked: boolean }) {
		const { value, checked } = detail;
		const interval = value as BeatInterval;

		let newEnabled: BeatInterval[];

		if (checked) {
			newEnabled = [...enabledIntervals, interval];
		} else {
			newEnabled = enabledIntervals.filter((i) => i !== interval);
		}

		settingsStore.setEnabledBeatIntervals(newEnabled);
	}
</script>

<div class="setting-item">
	<div class="setting-label">Enabled Beat Intervals</div>

	<CheckboxPillGroup
		name="enabled_intervals"
		options={intervalOptions}
		selectedValues={enabledIntervals}
		onchange={handleSelectionChange}
	/>
</div>