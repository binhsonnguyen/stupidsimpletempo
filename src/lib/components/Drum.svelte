<!-- src/lib/components/Drum.svelte -->
<script>
    /**
     * @type {boolean}
     */
    export let isRunning = false;

    /**
     * @type {() => void}
     */
    export let onToggle = () => {};
</script>

<button on:click={onToggle} class="start-stop-button" aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}>
</button>

<style>
</style>