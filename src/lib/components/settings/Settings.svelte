<!-- src/lib/components/settings/Settings.svelte (đã tái cấu trúc) -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { Sound } from '$lib/audio/Sound';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import SoundSelectorGroup from './SoundSelectorGroup.svelte'; // Import component mới

	const availableSounds = Sound.ALL_SOUNDS;
</script>

<div class="settings-container">
	<header class="settings-header">
		<a href="/" class="back-button" aria-label="Back to Metronome">
			<FontAwesomeIcon icon={faArrowLeft} />
		</a>
		<h1>Settings</h1>
	</header>

	<div class="settings-list">
		<SoundSelectorGroup
			label="Downbeat"
			name="strong-beat-sound"
			bind:group={$settingsStore.strongBeatSound}
			{availableSounds}
		/>

		<SoundSelectorGroup
			label="Upbeat"
			name="weak-beat-sound"
			bind:group={$settingsStore.weakBeatSound}
			{availableSounds}
		/>
	</div>
</div>

<style lang="scss">
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

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>