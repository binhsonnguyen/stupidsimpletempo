<!-- src/lib/components/time-notation-selector/TimeNotationSelector.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { metronomeStore, type BeatInterval } from '$lib/state/metronomeStore';

	type BeatIntervalOption = {
		label: string;
		value: BeatInterval;
		description: string;
	};

	const BEAT_INTERVAL_OPTIONS: BeatIntervalOption[] = [
		{ label: '1', value: '1m', description: 'Whole Note (Nốt tròn)' },
		{ label: '2', value: '2n', description: 'Half Note (Nốt trắng)' },
		{ label: '4', value: '4n', description: 'Quarter Note (Nốt đen)' },
		{ label: '8', value: '8n', description: 'Eighth Note (Nốt móc đơn)' },
		{ label: '16', value: '16n', description: 'Sixteenth Note (Nốt móc kép)' },
		{ label: '8³', value: '8t', description: 'Eighth Triplet (Chùm ba nốt móc đơn)' }
	];

	let stripOffset = 0;
	let currentIndex = 0;
	let isDragging = false;
	let viewWindowEl: HTMLElement; // Tham chiếu đến DOM element của "cửa sổ xem"

	let itemTotalWidth = 70; // Giá trị mặc định, sẽ được cập nhật trong onMount

	onMount(() => {
		const styles = getComputedStyle(viewWindowEl);
		const itemWidth = parseFloat(styles.getPropertyValue('--item-width'));
		const gap = parseFloat(styles.getPropertyValue('--gap'));
		itemTotalWidth = itemWidth + gap;

		const initialIndex = BEAT_INTERVAL_OPTIONS.findIndex(
			(opt) => opt.value === $metronomeStore.beatInterval
		);
		if (initialIndex !== -1) {
			currentIndex = initialIndex;
			stripOffset = -initialIndex * itemTotalWidth;
		}
	});

	// --- Logic Kéo-Thả (Custom Action) ---
	let startX = 0;
	let startOffset = 0;

	function draggableX(node: HTMLElement) {
		function handlePointerDown(event: PointerEvent) {
			isDragging = true;
			startX = event.clientX;
			startOffset = stripOffset;
			node.setPointerCapture(event.pointerId);
			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('pointerup', handlePointerUp);
		}

		function handlePointerMove(event: PointerEvent) {
			const dx = event.clientX - startX;
			stripOffset = startOffset + dx;
		}

		function handlePointerUp() {
			isDragging = false;
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);

			const closestIndex = Math.round(-stripOffset / itemTotalWidth);
			currentIndex = Math.max(0, Math.min(closestIndex, BEAT_INTERVAL_OPTIONS.length - 1));

			stripOffset = -currentIndex * itemTotalWidth;
			const selectedValue = BEAT_INTERVAL_OPTIONS[currentIndex].value;
			metronomeStore.setBeatInterval(selectedValue);
		}

		node.addEventListener('pointerdown', handlePointerDown);

		return {
			destroy() {
				node.removeEventListener('pointerdown', handlePointerDown);
				window.removeEventListener('pointermove', handlePointerMove);
				window.removeEventListener('pointerup', handlePointerUp);
			}
		};
	}
</script>

<div class="notation-wrapper">
	<div class="division-line"></div>

	<div class="view-window" bind:this={viewWindowEl}>
		<div
			class="number-strip"
			use:draggableX
			style:--offset="{stripOffset}px"
			class:is-dragging={isDragging}
		>
			{#each BEAT_INTERVAL_OPTIONS as bu, i (bu.value)}
				<div class="note-symbol-wrapper">
					<span class="note-symbol" class:active={currentIndex === i}>
						{@html bu.label}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="division-line"></div>
</div>

<style>
    :root {
        --visible-width: 100px;
        --item-width: 20px;
        --gap: 20px;
    }

    .notation-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .view-window {
        width: var(--visible-width);
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        cursor: grab;
    }

    .view-window:active {
        cursor: grabbing;
    }

    .number-strip {
        display: flex;
        gap: var(--gap);
        position: relative;
        transform: translateX(calc(var(--offset) + (var(--visible-width) - var(--item-width)) / 2));
        transition: transform 0.25s ease-out;
        will-change: transform;
    }

    .number-strip.is-dragging {
        transition: none;
    }

    .note-symbol-wrapper {
        width: var(--item-width);
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .note-symbol {
        font-size: 1em;
        font-weight: bold;
        color: #6c757d;
        transition: color 0.2s ease,
        transform 0.2s ease,
        opacity 0.2s ease;
        opacity: 0.5;
        transform: scale(0.8);
    }

    .note-symbol.active {
        color: #f8f9fa;
        opacity: 1;
        transform: scale(1.15);
    }

    .division-line {
        width: var(--visible-width);
        height: 1px;
        background-color: #6c757d;
    }
</style>