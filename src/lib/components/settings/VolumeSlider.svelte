<!-- src/lib/components/settings/VolumeSlider.svelte -->

<script lang="ts">
	import { volumeStore } from '$lib/state/volumeStore';
	import { settingsStore } from '$lib/state/settingsStore';
	import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	const allTicks = [0, 100, 150];
	const specialTicks = new Set([0, 100, 150]);

	const SNAP_THRESHOLD = 6;

	const fillPercent = $derived(
		($settingsStore.volume / $volumeStore.maxVolume) * 100
	);

	function handleWrapperClick(event: MouseEvent) {
		const wrapper = event.currentTarget as HTMLElement;
		const rect = wrapper.getBoundingClientRect();

		// Tính toán vị trí click (từ 0.0 đến 1.0)
		const clickX = event.clientX - rect.left;
		const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));

		// Chuyển đổi vị trí click thành giá trị âm lượng
		const clickedVolume = Math.round(clickRatio * $volumeStore.maxVolume);

		// Tìm vạch chia gần nhất với vị trí click
		const closestTick = allTicks.reduce((prev, curr) => {
			const prevDiff = Math.abs(prev - clickedVolume);
			const currDiff = Math.abs(curr - clickedVolume);
			return currDiff < prevDiff ? curr : prev;
		});

		if (Math.abs(closestTick - clickedVolume) <= SNAP_THRESHOLD) {
			volumeStore.setVolume(closestTick);
		} else {
			volumeStore.setVolume(clickedVolume);
		}
	}
</script>

<div class="setting-item">
	<div class="setting-label">Volume</div>

	<div class="volume-control">
		<button onclick={volumeStore.toggleMute} class="mute-button" aria-label="Toggle Mute">
			<FontAwesomeIcon icon={$volumeStore.isMuted ? faVolumeXmark : faVolumeHigh} />
		</button>

		<div class="slider-wrapper" onclick={handleWrapperClick}>
			<div class="visual-track" style="--fill-percent: {fillPercent}%"></div>
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
			/>
			<div class="ticks-container">
				{#each allTicks as tick}
					<span
						class="tick-mark"
						class:special={specialTicks.has(tick)}
						class:active={tick <= $settingsStore.volume}
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

  :root {
    --thumb-width: 20px;
  }

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
    cursor: pointer;
  }

  .ticks-container {
    position: absolute;
    width: calc(100% - var(--thumb-width));
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    bottom: 0;
    pointer-events: none;
  }

  .tick-mark {
    position: absolute;
    width: 1px;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.2s ease;

    height: 8px;
    background: rgba(255, 255, 255, 0.3);

    &.active {
      background: rgba(255, 255, 255, 1);
    }

    &.special {
      height: 12px;
    }
  }

  .visual-track {
    position: absolute;
    width: calc(100% - var(--thumb-width));
    height: 1px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(
                    to right,
                    variables.$primary-color var(--fill-percent, 0%),
                    rgba(255, 255, 255, 0.2) var(--fill-percent, 0%)
    );
    pointer-events: none;
  }

  .slider {
    position: absolute;
    width: 100%;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
    margin: 0;
    pointer-events: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--thumb-width);
    height: var(--thumb-width);
    background: #fff;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    transition: transform 0.2s ease;
    pointer-events: auto;
  }

  .slider::-moz-range-thumb {
    width: var(--thumb-width);
    height: var(--thumb-width);
    background: #fff;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    pointer-events: auto;
  }

  .slider:not(:disabled):hover::-webkit-slider-thumb,
  .slider:not(:disabled):active::-webkit-slider-thumb {
    transform: scale(1.2);
  }

  .slider:not(:disabled):hover::-moz-range-thumb,
  .slider:not(:disabled):active::-moz-range-thumb {
    transform: scale(1.2);
  }

  .slider:disabled .visual-track {
    background: linear-gradient(
                    to right,
                    #666 var(--fill-percent, 0%),
                    rgba(128, 128, 128, 0.2) var(--fill-percent, 0%)
    );
  }

  .slider:disabled::-webkit-slider-thumb,
  .slider:disabled::-moz-range-thumb {
    background: #888;
    transform: scale(1);
  }

  .volume-value {
    width: 4.5ch;
    font-variant-numeric: tabular-nums;
    text-align: right;
    opacity: 0.9;
  }
</style>