<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	const noteOptions = [
		{ label: '𝅝', value: '1n', description: 'Whole Note (Nốt tròn)' },
		{ label: '𝅗𝅥', value: '2n', description: 'Half Note (Nốt trắng)' },
		{ label: '♩', value: '4n', description: 'Quarter Note (Nốt đen)' },
		{ label: '♪', value: '8n', description: 'Eighth Note (Nốt móc đơn)' },
		{ label: '♬', value: '16n', description: 'Sixteenth Note (Nốt móc kép)' },
		{ label: '♪³', value: '8t', description: 'Eighth Triplet (Chùm ba nốt móc đơn)' }
	];
</script>

<div class="time-notation-selector-container">
	{#each noteOptions as note}
		<span class="note-symbol" title={note.description}>
			{@html note.label}
		</span>
	{/each}
</div>

<style>
    .time-notation-selector-container {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #6c757d;
    }

    .note-symbol {
        font-size: 1em;
        cursor: pointer;
        transition: color 0.2s ease, transform 0.2s ease;
    }

    .note-symbol:hover {
        color: #f8f9fa;
        transform: scale(1.1);
    }
</style>