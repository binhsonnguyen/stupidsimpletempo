<!-- src/lib/components/settings/Settings.svelte (ĐÚNG & KHÔNG CẦN THAY ĐỔI) -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { Sound } from '$lib/audio/Sound';
	import Icon from '$lib/components/icons/Icon.svelte';

	import SoundSelectorGroup from './SoundSelectorGroup.svelte';
	import VolumeSlider from './VolumeSlider.svelte';
	import DivisionSelector from './DivisionSelector.svelte';

	const availableSounds = Sound.ALL_SOUNDS;
</script>

<div class="settings-container">
	<header class="settings-header">
		<a href="/" class="back-button" aria-label="Back to Metronome">
			<Icon name="arrow-left" />
		</a>
		<h1>Settings</h1>
	</header>

	<div class="settings-list">
		{#if $settingsStore}
			<VolumeSlider />
			<hr class="divider" />

			<SoundSelectorGroup
				label="Downbeat"
				name="strongBeatSound"
				group={$settingsStore.strongBeatSound}
				{availableSounds}
			/>

			<SoundSelectorGroup
				label="Upbeat"
				name="weakBeatSound"
				group={$settingsStore.weakBeatSound}
				{availableSounds}
			/>
			<hr class="divider" />

			<DivisionSelector />
		{:else}
			<p>Loading settings...</p>
		{/if}
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
    margin-bottom: 1.5rem;

    .back-button {
      color: inherit;
      margin-right: 1.5rem;
      font-size: 1.5rem;
      opacity: 0.8;
      transition: opacity 0.2s;

      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        opacity: 1;
      }
    }

    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0;
    }
  }

  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .divider {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 0;
  }

  :global(.setting-item) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.setting-item .setting-label) {
    font-size: 1.2rem;
    font-weight: 600;
    color: variables.$base-forefront-muted;
    text-transform: capitalize;
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