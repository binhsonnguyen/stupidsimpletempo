<!-- src/lib/components/settings/SoundSelectorGroup.svelte -->

<script lang="ts">
	import type { SoundIdentifier } from '$lib/audio/Sound';
	import { Sound } from '$lib/audio/Sound';
	import { settingsStore } from '$lib/state/settingsStore';
	import RadioPillGroup from './RadioPillGroup.svelte';

	let {
		label,
		group,
		name,
		availableSounds
	} = $props<{
		label: string;
		group: SoundIdentifier;
		name: string;
		availableSounds: { identifier: SoundIdentifier }[];
	}>();

	const soundOptions = availableSounds.map((sound) => ({
		value: sound.identifier,
		label: sound.identifier.replace(/_/g, ' ').toLowerCase()
	}));

	function handleSoundChange(newSound: string) {
		const soundId = newSound as SoundIdentifier;

		settingsStore.updateSetting({ [name]: soundId });

		const soundToPlay = Sound.soundMap.get(soundId);
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
		onchange={handleSoundChange}
	/>
</div>
