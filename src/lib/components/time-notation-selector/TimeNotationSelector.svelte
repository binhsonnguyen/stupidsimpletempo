<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	const noteOptions = {
		WHOLE_NOTE: { label: '1', value: '1n', description: 'Whole Note (Nốt tròn)' },
		HALF_NOTE: { label: '2', value: '2n', description: 'Half Note (Nốt trắng)' },
		QUARTER_NOTE: { label: '4', value: '4n', description: 'Quarter Note (Nốt đen)' },
		EIGHTH_NOTE: { label: '8', value: '8n', description: 'Eighth Note (Nốt móc đơn)' },
		SIXTEENTH_NOTE: { label: '16', value: '16n', description: 'Sixteenth Note (Nốt móc kép)' },
		EIGHTH_TRIPLET: { label: '8³', value: '8t', description: 'Eighth Triplet (Chùm ba nốt móc đơn)' }
	};

	const displayNotes = [noteOptions.HALF_NOTE, noteOptions.QUARTER_NOTE, noteOptions.EIGHTH_NOTE];
</script>

<div class="notation-wrapper">
	<div class="division-line"></div>
	<div class="time-notation-selector-container">
		{#each displayNotes as note}
			<span class="note-symbol" title={note.description}>
				{@html note.label}
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
        color: #6c757d;
        gap: 20px;
    }

    .note-symbol {
        font-size: 1em;
        cursor: pointer;
        transition:
                color 0.2s ease,
                transform 0.2s ease;
    }

    .note-symbol:hover {
        color: #f8f9fa;
        transform: scale(1.1);
    }
</style>