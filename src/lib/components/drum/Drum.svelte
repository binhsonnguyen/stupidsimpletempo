<!-- src/lib/components/drum/Drum.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { Sound } from '$lib/audio/Sound';
	import { metronomeStore } from '$lib/state/metronomeStore';
	import { isAudioLoading } from '$lib/state/audioLoadingStore';
	import { beatSequenceStore } from '$lib/state/beatSequenceStore';
	import { volumeStore } from '$lib/state/volumeStore';
	import { swipeable } from '$lib/components/actions/swipeable';

	// 1. Thay đổi trạng thái để quản lý các chế độ chia
	// Các giá trị đại diện cho số lượng đường kẻ sẽ được vẽ
	const divisionModes = [0, 1, 2, 3, 4]; // 0: không chia, 1: chia đôi, 2: chia tư...
	let currentDivisionIndex = 0;

	// Giá trị derived để lấy số đường kẻ hiện tại
	$: numberOfLines = divisionModes[currentDivisionIndex];

	onMount(() => {
		const sequence = get(beatSequenceStore);
		if (sequence.head) {
			Sound.registerForPreload(sequence.head.sound);
		}
		volumeStore.setVolume(100);
		volumeStore.setBoostFactor(1.1);
	});

	function handleDrumClick() {
		metronomeStore.toggle();
	}

	// 2. Cập nhật hàm vuốt để xoay vòng qua các chế độ
	function cycleDivisions(direction: 'up' | 'down') {
		if (direction === 'up') {
			currentDivisionIndex = (currentDivisionIndex + 1) % divisionModes.length;
		} else {
			currentDivisionIndex =
				(currentDivisionIndex - 1 + divisionModes.length) % divisionModes.length;
		}
	}

	function handleSwipeLeft() {
		console.log('⬅️ Swipe Left Detected!');
	}

	function handleSwipeRight() {
		console.log('➡️ Swipe Right Detected!');
	}
</script>

<button
	on:click={handleDrumClick}
	use:swipeable
	on:swipeup={() => cycleDivisions('up')}
	on:swipedown={() => cycleDivisions('down')}
	on:swipeleft={handleSwipeLeft}
	on:swiperight={handleSwipeRight}
	class="start-stop-button"
	class:on={$metronomeStore.isRunning && !$isAudioLoading}
	class:off={!$metronomeStore.isRunning && !$isAudioLoading}
	class:loading={$isAudioLoading}
	aria-label={$isAudioLoading
		? 'Loading sounds...'
		: $metronomeStore.isRunning
		? 'Stop metronome'
		: 'Start metronome'}
	disabled={$isAudioLoading}
	tabindex="-1"
>
	<!-- 3. Dùng #each để sinh ra các đường kẻ một cách linh động -->
	<div class="division-lines-container">
		{#each Array(numberOfLines) as _, i (i)}
			{@const angle = (i / numberOfLines) * 180}
			<div
				class="division-line"
				style="--rotation-angle: {angle}deg;"
				transition:fade={{ duration: 150 }}
			></div>
		{/each}
	</div>
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

    /* ... các style cho .loading, .on, .off không đổi ... */
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

    /* 4. Style cho container và các đường kẻ động */
    .division-lines-container {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none; /* Để không cản trở việc click vào nút */
    }

    .division-line {
        content: '';
        position: absolute;
        width: 80%;
        height: 1px;
        background-color: rgba(248, 249, 250, 0.5);
        top: 50%;
        left: 10%;
        transform-origin: center; /* Rất quan trọng: xoay quanh tâm */
        transform: translateY(-50%) rotate(var(--rotation-angle));
    }
</style>