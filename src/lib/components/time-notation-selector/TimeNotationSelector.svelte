<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { metronomeStore, type BeatInterval, VALID_BEAT_INTERVALS } from '$lib/state/metronomeStore';

	const BEAT_INTERVALS = {
		WHOLE_NOTE: { label: '1m', value: VALID_BEAT_INTERVALS[0], description: 'Whole Note (Nốt tròn)' },
		HALF_NOTE: { label: '2', value: VALID_BEAT_INTERVALS[1], description: 'Half Note (Nốt trắng)' },
		QUARTER_NOTE: { label: '4', value: VALID_BEAT_INTERVALS[2], description: 'Quarter Note (Nốt đen)' },
		EIGHTH_NOTE: { label: '8', value: VALID_BEAT_INTERVALS[3], description: 'Eighth Note (Nốt móc đơn)' },
		SIXTEENTH_NOTE: { label: '16', value: VALID_BEAT_INTERVALS[4], description: 'Sixteenth Note (Nốt móc kép)' },
		EIGHTH_TRIPLET: { label: '8t', value: VALID_BEAT_INTERVALS[5], description: 'Eighth Triplet (Chùm ba nốt móc đơn)' }
	};

	const BEAT_INTERVAL_OPTIONS = [
		BEAT_INTERVALS.HALF_NOTE,
		BEAT_INTERVALS.QUARTER_NOTE,
		BEAT_INTERVALS.EIGHTH_NOTE
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