<!-- src/lib/components/settings/Settings.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import { Sound, type SoundIdentifier } from '$lib/audio/Sound'; // Import thêm type
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

	const availableSounds = Sound.ALL_SOUNDS;

	function formatSoundName(identifier: SoundIdentifier): string {
		return identifier.replace(/_/g, ' ');
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
		<div class="setting-item">
			<label for="strong-beat-select">Accent</label>
			<select id="strong-beat-select" bind:value={$settingsStore.strongBeatSound}>
				{#each availableSounds as sound}
					<option value={sound.identifier}>{formatSoundName(sound.identifier)}</option>
				{/each}
			</select>
		</div>

		<div class="setting-item">
			<label for="weak-beat-select">Beat</label>
			<select id="weak-beat-select" bind:value={$settingsStore.weakBeatSound}>
				{#each availableSounds as sound}
					<option value={sound.identifier}>{formatSoundName(sound.identifier)}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<style lang="scss">
</style>