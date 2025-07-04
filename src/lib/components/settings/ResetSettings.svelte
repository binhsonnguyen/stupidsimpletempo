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

<div class="reset-container">
	<button class="reset-button" on:click={handleResetClick}>
		<Icon name="refresh-ccw" />
		<span>Reset all settings</span>
	</button>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .reset-container {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }

  .reset-button {
    width: auto;
    padding: 12px 16px;
    background-color: transparent;
    border: none;

    color: variables.$base-forefront-muted;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 400;
    transition: all 0.2s ease-in-out;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5em;

    &:hover {
      color: variables.$danger-color-3;
      background-color: rgba(variables.$danger-color-3, 0.08);
    }
  }

  .reset-button :global(svg) {
    width: 1.8rem;
    height: 1.8rem;
  }
</style>