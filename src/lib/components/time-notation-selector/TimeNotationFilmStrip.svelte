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
	import { onMount } from 'svelte';

	export let options: BeatIntervalOption[] = [];

	let stripOffset = 0;
	let isDragging = false;
	let viewWindowEl: HTMLElement;
	let itemTotalWidth = 70; // Giá trị mặc định, sẽ được tính toán lại

	onMount(() => {
		const styles = getComputedStyle(viewWindowEl);
		const itemWidth = parseFloat(styles.getPropertyValue('--item-width'));
		const gap = parseFloat(styles.getPropertyValue('--gap'));
		itemTotalWidth = itemWidth + gap;
	});

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

<div class="view-window" bind:this={viewWindowEl}>
	<div
		class="number-strip"
		use:draggableX
		style:--offset="{stripOffset}px"
		class:is-dragging={isDragging}
	>
		{#each options as bi (bi.value)}
			<div class="note-symbol-wrapper">
				<span class="note-symbol">
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
        justify-content: center;
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
        transition: transform 0.2s ease, opacity 0.2s ease;
        opacity: 0.5;
        transform: scale(0.8);
    }
</style>