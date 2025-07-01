<!-- src/lib/components/settings/Settings.svelte -->
<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { Sound } from '$lib/audio/Sound';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
		<div class="setting-item">
			<label for="strong-beat-select">Accent / Strong Beat</label>
			<select id="strong-beat-select" bind:value={$settingsStore.strongBeatSound}>
				{#each availableSounds as sound}
					<option value={sound.identifier}>{sound.identifier.replace(/_/g, ' ')}</option>
				{/each}
			</select>
		</div>

		<div class="setting-item">
			<label for="weak-beat-select">Beat / Weak Beat</label>
			<select id="weak-beat-select" bind:value={$settingsStore.weakBeatSound}>
				{#each availableSounds as sound}
					<option value={sound.identifier}>{sound.identifier.replace(/_/g, ' ')}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<style lang="scss">
  .settings-container {
    width: 100%;
    min-width: 320px;
    max-width: 420px;
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

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    label {
      font-size: 1.0rem;
      //font-weight: 200;
      padding-right: 1rem;
    }
  }

  select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #555;
    background-color: #333;
    color: #eee;
    min-width: 180px;
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

  @media (max-width: 480px) {
    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    select {
      width: 100%;
    }

    .settings-header {
      h1 {
        font-size: 2rem;
      }
    }
  }
</style>