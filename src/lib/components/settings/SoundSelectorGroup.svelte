<!-- src/lib/components/settings/SoundSelectorGroup.svelte -->

<script lang="ts">
	import type { SoundIdentifier } from '$lib/audio/Sound';
	import { Sound } from '$lib/audio/Sound';
	import { settingsStore } from '$lib/state/settingsStore';
	import RadioPillGroup from './RadioPillGroup.svelte';

	export let label: string;
	export let group: SoundIdentifier;
	export let name: string;
	export let availableSounds: { identifier: SoundIdentifier }[];

	const soundOptions = availableSounds.map((sound) => ({
		value: sound.identifier,
		label: sound.identifier.replace(/_/g, ' ').toLowerCase()
	}));

	function handleSoundChange(event: CustomEvent<string>) {
		const newSound = event.detail as SoundIdentifier;

		settingsStore.updateSetting({ [name]: newSound });

		const soundToPlay = Sound.soundMap.get(newSound);
		if (soundToPlay) {
			soundToPlay.play();
		}
	}
</script>

<div class="setting-item">
	<div class="setting-label">{label}</div>

	<RadioPillGroup
		{name}
		options={soundOptions}
		selectedValue={group}
		on:change={handleSoundChange}
	/>
</div>
