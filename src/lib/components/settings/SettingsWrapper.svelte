<!-- src/lib/components/settings/SettingsWrapper.svelte -->
<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import SoundSelector from './SettingItem.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="settings-wrapper">
	<header class="settings-header">
		<a href="/" class="back-button" aria-label="Back to Metronome">
			<FontAwesomeIcon icon={faArrowLeft} />
		</a>
		<h1>Settings</h1>
	</header>

	<div class="settings-list">
		<SoundSelector
			label="Accent / Strong Beat"
			selectedValue={$settingsStore.strongBeatSound}
			onSelectionChange={settingsStore.setStrongBeatSound}
		/>
		<SoundSelector
			label="Beat / Weak Beat"
			selectedValue={$settingsStore.weakBeatSound}
			onSelectionChange={settingsStore.setWeakBeatSound}
		/>
	</div>
</div>

<style lang="scss">
  .settings-wrapper {
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
    color: white;

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