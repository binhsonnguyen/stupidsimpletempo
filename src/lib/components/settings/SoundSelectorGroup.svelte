<!-- src/lib/components/settings/SoundSelectorGroup.svelte -->

<script lang="ts">
	import type { SoundIdentifier } from '$lib/audio/Sound';
	import RadioPill from './RadioPill.svelte'; // <-- Import component mới

	export let label: string;
	export let group: SoundIdentifier;
	export let name: string;
	export let availableSounds: { identifier: SoundIdentifier }[];

	function formatSoundName(identifier: SoundIdentifier): string {
		return identifier.replace(/_/g, ' ').toLowerCase();
	}
</script>

<div class="setting-group">
	<h2 class="setting-label">{label}</h2>
	<div class="radio-options-container">
		{#each availableSounds as sound (sound.identifier)}
			<RadioPill
				id="{name}-{sound.identifier}"
				{name}
				value={sound.identifier}
				bind:group
				label={formatSoundName(sound.identifier)}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .setting-group {
    margin-bottom: 2.5rem;
  }

  .setting-label {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: variables.$base-forefront-muted;
  }

  .radio-options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>