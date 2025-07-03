<!-- src/lib/components/settings/VolumeSlider.svelte -->

<script lang="ts">
	import { volumeStore } from '$lib/state/volumeStore';
	import { settingsStore } from '$lib/state/settingsStore';
	import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
</script>

<div class="setting-item">
	<div class="setting-label">Volume</div>

	<div class="volume-control">
		<button on:click={volumeStore.toggleMute} class="mute-button" aria-label="Toggle Mute">
			<FontAwesomeIcon icon={$volumeStore.isMuted ? faVolumeXmark : faVolumeHigh} />
		</button>
		<input
			type="range"
			id="volume-slider"
			min={$volumeStore.minVolume}
			max={$volumeStore.maxVolume}
			step="1"
			bind:value={$settingsStore.volume}
			on:input={() => volumeStore.setVolume($settingsStore.volume)}
			disabled={$volumeStore.isMuted}
			class="slider"
		/>
		<span class="volume-value">{$settingsStore.volume}%</span>
	</div>
</div>

<style lang="scss">
  .volume-control {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mute-button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.2s;
    padding: 0.5rem;
    line-height: 1;

    &:hover {
      opacity: 1;
    }
  }

  .slider {
    flex-grow: 1;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    outline: none;
    opacity: 0.8;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #eee;
      cursor: pointer;
      border-radius: 50%;
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: #eee;
      cursor: pointer;
      border-radius: 50%;
      border: none;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;

      &::-webkit-slider-thumb {
        background: #888;
      }
      &::-moz-range-thumb {
        background: #888;
      }
    }
  }

  .volume-value {
    font-variant-numeric: tabular-nums;
    min-width: 4ch;
    text-align: right;
    opacity: 0.9;
  }
</style>