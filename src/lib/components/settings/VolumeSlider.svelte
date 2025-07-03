<!-- src/lib/components/settings/VolumeSlider.svelte -->

<script lang="ts">
	import { volumeStore } from '$lib/state/volumeStore';
	import { settingsStore } from '$lib/state/settingsStore';
	import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	const ticks = [0, 50, 80, 90, 95, 110, 120, 130, 150];

	const fillPercent = $derived(
		($settingsStore.volume / $volumeStore.maxVolume) * 100
	);
</script>

<div class="setting-item">
	<div class="setting-label">Volume</div>

	<div class="volume-control">
		<button onclick={volumeStore.toggleMute} class="mute-button" aria-label="Toggle Mute">
			<FontAwesomeIcon icon={$volumeStore.isMuted ? faVolumeXmark : faVolumeHigh} />
		</button>

		<div class="slider-wrapper">
			<input
				type="range"
				id="volume-slider"
				min={$volumeStore.minVolume}
				max={$volumeStore.maxVolume}
				step="1"
				bind:value={$settingsStore.volume}
				oninput={() => volumeStore.setVolume($settingsStore.volume)}
				disabled={$volumeStore.isMuted}
				class="slider"
				style="--fill-percent: {fillPercent}%"
			/>
			<div class="ticks-container">
				{#each ticks as tick}
					<span
						class="tick-mark"
						style="left: {(tick / $volumeStore.maxVolume) * 100}%"
					></span>
				{/each}
			</div>
		</div>

		<span class="volume-value">{$settingsStore.volume}%</span>
	</div>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

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

  .slider-wrapper {
    position: relative;
    flex-grow: 1;
    display: flex;
    align-items: center;
    height: 20px;
  }

  .ticks-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .tick-mark {
    position: absolute;
    width: 1px;
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    top: 50%;
    transform: translateY(-50%);
  }

  .slider {
    position: absolute;
    width: 100%;

    flex-grow: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 1px;
    border-radius: 4px;
    outline: none;
    transition: opacity 0.2s;

    background: linear-gradient(
                    to right,
                    variables.$primary-color var(--fill-percent, 0%),
                    rgba(255, 255, 255, 0.2) var(--fill-percent, 0%)
    );

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #fff;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      transition: transform 0.2s ease;
      pointer-events: auto;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #fff;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      pointer-events: auto;
    }

    &:not(:disabled):hover::-webkit-slider-thumb,
    &:not(:disabled):active::-webkit-slider-thumb {
      transform: scale(1.2);
    }
    &:not(:disabled):hover::-moz-range-thumb,
    &:not(:disabled):active::-moz-range-thumb {
      transform: scale(1.2);
    }

    &:disabled {
      cursor: not-allowed;
      background: linear-gradient(
                      to right,
                      #666 var(--fill-percent, 0%),
                      rgba(128, 128, 128, 0.2) var(--fill-percent, 0%)
      );

      &::-webkit-slider-thumb {
        background: #888;
        transform: scale(1);
      }
      &::-moz-range-thumb {
        background: #888;
        transform: scale(1);
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