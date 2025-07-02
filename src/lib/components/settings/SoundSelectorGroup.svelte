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
				<label
					class="radio-label"
					for="{name}-{sound.identifier}"
					data-text={formatSoundName(sound.identifier)}
				>
					<span>{formatSoundName(sound.identifier)}</span>
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
      position: relative;
      display: inline-block;
      padding: 5px 18px;
      border: 1px solid variables.$base-border;
      border-radius: 999px;
      background-color: transparent;
      color: variables.$base-forefront;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-transform: lowercase;
      user-select: none;

      &:hover {
        background-color: variables.$base-background-hover;
        color: variables.$base-forefront;
      }

      /* Lớp "ma" để giữ chỗ cho chữ đậm */
      &::before {
        content: attr(data-text);
        display: block;
        font-weight: 600;
        visibility: hidden;
      }

      /* Lớp chứa text thật sự, nằm đè lên trên */
      span {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: font-weight 0.1s;
      }
    }
  }

  input[type='radio']:checked + .radio-label {
    background-color: variables.$primary-color;
    color: variables.$base-background;
    border-color: variables.$primary-color;
  }

  input[type='radio']:checked + .radio-label span {
    font-weight: 600;
  }
</style>