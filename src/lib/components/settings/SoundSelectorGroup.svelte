<!-- src/lib/components/settings/SoundSelectorGroup.svelte -->

<script lang="ts">
	import type { SoundIdentifier } from '$lib/audio/Sound';
	import RadioPill from './RadioPill.svelte';
	import { Sound } from '$lib/audio/Sound';

	export let label: string;
	export let group: SoundIdentifier;
	export let name: string;
	export let availableSounds: { identifier: SoundIdentifier }[];

	function formatSoundName(identifier: SoundIdentifier): string {
		return identifier.replace(/_/g, ' ').toLowerCase();
	}

	function handlePillClick(soundIdentifier: string) {
		const soundToPlay = Sound.soundMap.get(<SoundIdentifier>soundIdentifier);

		if (soundToPlay) {
			soundToPlay.play();
		}
	}
</script>

<div class="setting-item">
	<div class="setting-label">{label}</div>
	<div class="radio-options-container">
		{#each availableSounds as sound (sound.identifier)}
			<RadioPill
				id="{name}-{sound.identifier}"
				{name}
				value={sound.identifier}
				bind:group
				label={formatSoundName(sound.identifier)}
				onPillClick={handlePillClick}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
  .radio-options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>