<!-- src/lib/components/settings/ResetSettings.svelte -->

<script lang="ts">
	import { settingsStore } from '$lib/state/settingsStore';
	import Icon from '$lib/components/icons/Icon.svelte';

	function handleResetClick() {
		const isConfirmed = window.confirm(
			'Are you sure you want to reset all settings to their defaults? This action cannot be undone.'
		);

		if (isConfirmed) {
			settingsStore.reset();
		}
	}
</script>

<div class="setting-item reset-container">
	<button class="reset-button" on:click={handleResetClick}>
		<Icon name="rotate-ccw" />
		<span>Reset All Settings</span>
	</button>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .reset-container {
    margin-top: 1rem;
  }

  .reset-button {
    width: 100%;
    padding: 12px 20px;
    background-color: transparent;
    border: 1px solid rgba(variables.$danger-color-3, 0.5);
    color: rgba(variables.$danger-color-3, 0.9);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease-in-out;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75em;

    &:hover {
      background-color: rgba(variables.$danger-color-3, 0.1);
      color: variables.$danger-color-3;
      border-color: variables.$danger-color-3;
    }
  }
</style>