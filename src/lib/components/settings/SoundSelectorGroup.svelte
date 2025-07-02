<!-- src/lib/components/settings/SoundSelectorGroup.svelte -->

<script lang="ts">
	import type { SoundIdentifier } from '$lib/audio/Sound';

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
			<div class="radio-option">
				<input
					type="radio"
					id="{name}-{sound.identifier}"
					{name}
					bind:group
					value={sound.identifier}
				/>
				<label class="radio-label" for="{name}-{sound.identifier}">
					{formatSoundName(sound.identifier)}
				</label>
			</div>
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

  .radio-option {
    position: relative;
    font-size: 0.9rem;

    input[type='radio'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio-label {
      display: inline-block;
      padding: 5px 18px;
      border: 1px solid variables.$base-border;
      border-radius: 999px;
      background-color: transparent;
      color: variables.$base-forefront-muted;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-transform: lowercase;

      &:hover {
        background-color: variables.$base-background-hover;
        color: variables.$base-forefront;
      }
    }
  }

  input[type='radio']:checked + .radio-label {
    background-color: variables.$primary-color;
    color: variables.$base-background;
    border-color: variables.$primary-color;
    font-weight: 600;
  }
</style>
