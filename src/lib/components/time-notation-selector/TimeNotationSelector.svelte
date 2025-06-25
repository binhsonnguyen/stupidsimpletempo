<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { metronomeStore, type BeatInterval } from '$lib/state/metronomeStore';

	type BeatIntervalOption = {
		label: string;
		value: BeatInterval;
		description: string;
	};

	const BEAT_INTERVAL_OPTIONS: BeatIntervalOption[] = [
		{ label: '2', value: '2n', description: 'Half Note (Nốt trắng)' },
		{ label: '4', value: '4n', description: 'Quarter Note (Nốt đen)' },
		{ label: '8', value: '8n', description: 'Eighth Note (Nốt móc đơn)' }
	];

	function handleSelect(value: BeatInterval) {
		metronomeStore.setBeatInterval(value);
	}

	function handleKeyPress(event: KeyboardEvent, value: BeatInterval) {
		if (event.key === 'Enter' || event.key === ' ') {
			handleSelect(value);
		}
	}
</script>

<div class="notation-wrapper">
	<div class="division-line" />
	<div class="time-notation-selector-container">
		{#each BEAT_INTERVAL_OPTIONS as bu (bu.value)}
			<span
				class="note-symbol"
				class:active={$metronomeStore.beatInterval === bu.value}
				on:click={() => handleSelect(bu.value)}
				on:keypress={(e) => handleKeyPress(e, bu.value)}
				role="button"
				tabindex="0"
				title={bu.description}
			>
				{bu.label}
			</span>
		{/each}
	</div>
</div>

<style>
    .notation-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .division-line {
        width: 100px;
        height: 1px;
        background-color: #6c757d;
        margin-bottom: 8px;
    }

    .time-notation-selector-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .note-symbol {
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        color: #6c757d;
        transition: color 0.2s ease,
        transform 0.2s ease;
    }

    .note-symbol:hover {
        color: #f8f9fa;
        transform: scale(1.1);
    }

    .note-symbol.active {
        color: #f8f9fa;
        transform: scale(1.15);
    }
</style>