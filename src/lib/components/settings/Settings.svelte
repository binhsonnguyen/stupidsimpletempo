<!-- src/lib/components/settings/Settings.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { Sound, type SoundIdentifier } from '$lib/audio/Sound';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

	const availableSounds = Sound.ALL_SOUNDS;

	function formatSoundName(identifier: SoundIdentifier): string {
		return identifier.replace(/_/g, ' ').toLowerCase();
	}
</script>

<div class="settings-container">
	<header class="settings-header">
		<a href="/" class="back-button" aria-label="Back to Metronome">
			<FontAwesomeIcon icon={faArrowLeft} />
		</a>
		<h1>Settings</h1>
	</header>

	<div class="settings-list">
		<div class="setting-group">
			<h2 class="setting-label">Downbeat</h2>
			<div class="radio-options-container">
				{#each availableSounds as sound (sound.identifier)}
					<div class="radio-option">
						<input
							type="radio"
							id="strong-{sound.identifier}"
							name="strong-beat-sound"
							bind:group={$settingsStore.strongBeatSound}
							value={sound.identifier}
						/>
						<label class="radio-label" for="strong-{sound.identifier}">
							{formatSoundName(sound.identifier)}
						</label>
					</div>
				{/each}
			</div>
		</div>

		<div class="setting-group">
			<h2 class="setting-label">Upbeat</h2>
			<div class="radio-options-container">
				{#each availableSounds as sound (sound.identifier)}
					<div class="radio-option">
						<input
							type="radio"
							id="weak-{sound.identifier}"
							name="weak-beat-sound"
							bind:group={$settingsStore.weakBeatSound}
							value={sound.identifier}
						/>
						<label class="radio-label" for="weak-{sound.identifier}">
							{formatSoundName(sound.identifier)}
						</label>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .settings-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    animation: fade-in 0.5s ease-out;
  }

  .settings-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    .back-button {
      color: inherit;
      margin-right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.8;
      transition: opacity 0.2s;
      &:hover {
        opacity: 1;
      }
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
    }
  }

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

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>