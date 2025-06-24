<!-- src/lib/components/Drum.svelte -->
<script lang="ts">
		import { onMount, onDestroy } from 'svelte';
		import * as Tone from 'tone';

		export let isRunning = false;

		let player: Tone.Player | null = null;

		onMount(() => {
			player = new Tone.Player('/sound/woodblock.mp3').toDestination();
		});

		onDestroy(() => {
			player?.dispose();
		});

		function handleDrumClick() {
			if (Tone.getContext().state !== 'running') {
				Tone.start();
			}

			player?.start();
		}
</script>

<button
        on:click={handleDrumClick}
        class="start-stop-button"
        class:on={isRunning}
        class:off={!isRunning}
        aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
        tabindex="-1"
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

    .start-stop-button:focus-visible {
        outline: none;
    }
</style>
