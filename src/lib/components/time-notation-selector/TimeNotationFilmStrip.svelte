<!-- src/lib/components/time-notation-selector/TimeNotationFilmStrip.svelte -->

<script context="module" lang="ts">
	import type { BeatInterval } from '$lib/state/metronomeStore';

	export type BeatIntervalOption = {
		label: string;
		value: BeatInterval;
		description: string;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let options: BeatIntervalOption[] = [];
	export let initialValue: BeatInterval;

	const dispatch = createEventDispatcher<{ change: BeatInterval }>();

	const OVERDRAG_AMOUNT = 10; // px

	let stripOffset = 0;
	let isDragging = false;
	let viewWindowEl: HTMLElement;
	let itemTotalWidth = 0;
	let visibleWidth = 0;
	let itemWidth = 0;
	let currentIndex = 0;

	// "Ranh giới cứng" - phạm vi hợp lệ cuối cùng
	let minOffset = 0;
	let maxOffset = 0;

	// "Ranh giới mềm" - phạm vi cho phép kéo lố
	let minClampOffset = 0;
	let maxClampOffset = 0;

	function getOffsetForIndex(index: number): number {
		const centerOfViewWindow = visibleWidth / 2;
		const centerOfItemRelativeToStrip = index * itemTotalWidth + itemWidth / 2;
		return centerOfViewWindow - centerOfItemRelativeToStrip;
	}

	onMount(() => {
		const styles = getComputedStyle(viewWindowEl);
		itemWidth = parseFloat(styles.getPropertyValue('--item-width'));
		const gap = parseFloat(styles.getPropertyValue('--gap'));
		itemTotalWidth = itemWidth + gap;
		visibleWidth = viewWindowEl.clientWidth;

		if (options.length > 0) {
			// --- Logic ranh giới một phía ---
			maxOffset = visibleWidth / 2;
			minOffset = visibleWidth / 2 - options.length * itemTotalWidth;

			// Tính toán "ranh giới mềm"
			minClampOffset = minOffset - OVERDRAG_AMOUNT;
			maxClampOffset = maxOffset + OVERDRAG_AMOUNT;

			// Đặt vị trí ban đầu dựa trên initialValue
			const initialIndex = options.findIndex((opt) => opt.value === initialValue);
			if (initialIndex !== -1) {
				currentIndex = initialIndex;
				stripOffset = getOffsetForIndex(currentIndex);
			}
		}
	});

	// Khối reactive để cập nhật vị trí nếu initialValue thay đổi từ bên ngoài
	$: if (options.length > 0 && itemTotalWidth > 0 && !isDragging) {
		const newIndex = options.findIndex((opt) => opt.value === initialValue);
		if (newIndex !== -1 && newIndex !== currentIndex) {
			currentIndex = newIndex;
			stripOffset = getOffsetForIndex(newIndex);
		}
	}

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
			if (!isDragging) return;
			const dx = event.clientX - startX;
			const newOffset = startOffset + dx;

			// Kẹp giá trị offset trong "ranh giới mềm"
			stripOffset = Math.max(minClampOffset, Math.min(newOffset, maxClampOffset));
		}

		function handlePointerUp() {
			if (!isDragging) return;
			isDragging = false;
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);

			// Công thức đảo ngược để tìm index của nốt nhạc gần tâm nhất
			const potentialIndex = Math.round(
				(visibleWidth / 2 - stripOffset - itemWidth / 2) / itemTotalWidth
			);

			// Kẹp index trong phạm vi hợp lệ của mảng
			const newIndex = Math.max(0, Math.min(potentialIndex, options.length - 1));

			// Hít dải film về vị trí căn giữa của index mới
			stripOffset = getOffsetForIndex(newIndex);

			// Chỉ cập nhật và thông báo ra ngoài nếu lựa chọn thực sự thay đổi
			if (currentIndex !== newIndex) {
				currentIndex = newIndex;
				const selectedValue = options[currentIndex].value;
				dispatch('change', selectedValue);
			}
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

<div class="view-window" bind:this={viewWindowEl} use:draggableX>
	<div
		class="number-strip"
		style:--offset="{stripOffset}px"
		class:is-dragging={isDragging}
	>
		{#each options as bi (bi.value)}
			<div class="note-symbol-wrapper">
				<span class="note-symbol">
					<!--eslint-disable-next-line svelte/no-at-html-tags-->
					{@html bi.label}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
    :root {
        --visible-width: 100px;
        --item-width: 12px;
        --gap: 20px;
    }

    .view-window {
        width: var(--visible-width);
        height: 30px;
        display: flex;
        align-items: center;
        overflow: hidden;
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
    }

    .view-window:active {
        cursor: grabbing;
    }

    .number-strip {
        display: flex;
        gap: var(--gap);
        position: relative;
        transform: translateX(var(--offset));
        transition: transform 0.25s ease-out;
        will-change: transform;
        pointer-events: none;
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
</style>