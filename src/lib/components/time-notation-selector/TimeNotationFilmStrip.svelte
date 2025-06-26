<!-- src/lib/components/time-notation-selector/TimeNotationFilmStrip.svelte -->

<script context="module" lang="ts">
	import type { BeatInterval } from '$lib/state/metronomeStore';

	export type BeatIntervalOption = {
		label: string;
		symbol: string;
		value: BeatInterval;
		description: string;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { filmStripVisibilityStore } from '$lib/state/visibilityStore';

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
	let activeVisualIndex = 0;

	let minOffset = 0;
	let maxOffset = 0;
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
			maxOffset = visibleWidth / 2;
			minOffset = visibleWidth / 2 - options.length * itemTotalWidth;
			minClampOffset = minOffset - OVERDRAG_AMOUNT;
			maxClampOffset = maxOffset + OVERDRAG_AMOUNT;

			const initialIndex = options.findIndex((opt) => opt.value === initialValue);
			if (initialIndex !== -1) {
				currentIndex = initialIndex;
				stripOffset = getOffsetForIndex(currentIndex);
				activeVisualIndex = currentIndex;
			}
		}

		filmStripVisibilityStore.startHideTimer();
	});

	$: if (options.length > 0 && itemTotalWidth > 0 && !isDragging) {
		const newIndex = options.findIndex((opt) => opt.value === initialValue);
		if (newIndex !== -1 && newIndex !== currentIndex) {
			currentIndex = newIndex;
			stripOffset = getOffsetForIndex(newIndex);
			activeVisualIndex = currentIndex;
		}
	}

	$: {
		if (options.length > 0 && itemTotalWidth > 0 && visibleWidth > 0) {
			const calculatedIndex = Math.round(
				(visibleWidth / 2 - stripOffset - itemWidth / 2) / itemTotalWidth
			);
			activeVisualIndex = Math.max(0, Math.min(calculatedIndex, options.length - 1));
		}
	}

	let startX = 0;
	let startOffset = 0;

	function draggableX(node: HTMLElement) {
		function handlePointerDown(event: PointerEvent) {
			filmStripVisibilityStore.show();
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
			stripOffset = Math.max(minClampOffset, Math.min(newOffset, maxClampOffset));
		}

		function handlePointerUp() {
			if (!isDragging) return;
			isDragging = false;
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);

			const potentialIndex = Math.round(
				(visibleWidth / 2 - stripOffset - itemWidth / 2) / itemTotalWidth
			);
			const newIndex = Math.max(0, Math.min(potentialIndex, options.length - 1));
			stripOffset = getOffsetForIndex(newIndex);

			if (currentIndex !== newIndex) {
				currentIndex = newIndex;
				const selectedValue = options[currentIndex].value;
				dispatch('change', selectedValue);
			}

			filmStripVisibilityStore.startHideTimer();
		}

		node.addEventListener('pointerdown', handlePointerDown);

		return {
			destroy() {
				node.removeEventListener('pointerdown', handlePointerDown);
				window.removeEventListener('pointermove', handlePointerMove);
				window.removeEventListener('pointerup', handlePointerUp);
				filmStripVisibilityStore.cancelHideTimer();
			}
		};
	}
</script>

<div
	class="film-strip-container"
	class:hidden={!$filmStripVisibilityStore}
	on:pointerenter={filmStripVisibilityStore.show}
	on:pointerleave={filmStripVisibilityStore.startHideTimer}
>
	<div class="division-line" class:hides-with-strip={!$filmStripVisibilityStore}></div>

	<div class="view-window" bind:this={viewWindowEl} use:draggableX>
		<div class="center-marker-top" class:hides-with-strip={!$filmStripVisibilityStore}></div>
		<div class="center-marker-bottom" class:hides-with-strip={!$filmStripVisibilityStore}></div>

		<div class="number-strip" style:--offset="{stripOffset}px" class:is-dragging={isDragging}>
			{#each options as bi, i (bi.value)}
				<div class="note-symbol-wrapper">
					<span
						class="note-symbol"
						class:active={activeVisualIndex === i}
						class:hides-with-strip={!$filmStripVisibilityStore && currentIndex !== i}
						class:standalone={!$filmStripVisibilityStore && currentIndex === i}
					>
						<span class="label-part">
							<!--eslint-disable-next-line svelte/no-at-html-tags-->
							{@html bi.label}
						</span>
						<span class="symbol-part music-note-font">
							{bi.symbol}
						</span>
					</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="division-line" class:hides-with-strip={!$filmStripVisibilityStore}></div>
</div>

<style>
    .film-strip-container {
        --visible-width: 100px;
        --item-width: 12px;
        --gap: 20px;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .film-strip-container.hidden {
        /* No styles needed here anymore for this logic */
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
        position: relative;
    }

    .view-window:active {
        cursor: grabbing;
    }

    .center-marker-top,
    .center-marker-bottom,
    .division-line {
        transition: opacity 0.3s ease-in-out;
    }

    .center-marker-top,
    .center-marker-bottom {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
        z-index: 2;
    }

    .center-marker-top {
        border-top: 5px solid #dee2e6;
        top: 2px;
    }

    .center-marker-bottom {
        border-bottom: 5px solid #dee2e6;
        bottom: 2px;
    }

    .number-strip {
        display: flex;
        gap: var(--gap);
        position: relative;
        transform: translateX(var(--offset));
        transition: transform 0.25s ease-out;
        will-change: transform;
        pointer-events: none;
        z-index: 1;
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
        font-size: 0.8em;
        font-weight: bold;
        color: #6c757d;
        transition: color 0.2s ease, opacity 0.2s ease;
        opacity: 0.5;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .note-symbol.active {
        color: #ff0000;
        opacity: 1;
    }

    .label-part,
    .symbol-part {
        position: absolute;
        transition: opacity 0.3s ease-in-out;
    }

    .label-part {
        opacity: 1;
    }

    .symbol-part {
        opacity: 0;
    }

    .note-symbol.standalone .label-part {
        opacity: 0;
    }

    .note-symbol.standalone .symbol-part {
        opacity: 1;
        transition-delay: 0.25s;
    }

    .music-note-font {
        font-family: 'Noto Music', sans-serif;
        font-size: 1.8em;
        line-height: 1;
    }

    .division-line {
        width: var(--visible-width);
        height: 1px;
        background-color: #6c757d;
    }

    .hides-with-strip {
        opacity: 0;
    }
</style>