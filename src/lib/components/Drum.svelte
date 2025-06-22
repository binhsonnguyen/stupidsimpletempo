<!-- src/lib/components/Drum.svelte -->
<script>
    export let isRunning = false;
    export let isLoading = false;
    export let onToggle = () => {
    };
</script>

<button
        on:click={onToggle}
        class="start-stop-button"
        class:loading={isLoading}
        class:on={isRunning && !isLoading}
        class:off={!isRunning && !isLoading}
        aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
>
</button>

<style>
    .start-stop-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        background-color: transparent;
        transition: box-shadow 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .start-stop-button.loading {
        box-shadow: 0 0 15px rgba(108, 117, 125, 0.5);
        cursor: wait;
    }

    .start-stop-button.off {
        box-shadow: 0 0 15px rgba(40, 167, 69, 0.7);
    }

    .start-stop-button.on {
        box-shadow: 0 0 15px rgba(220, 53, 69, 0.7);
    }
</style>