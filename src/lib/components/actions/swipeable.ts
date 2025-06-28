// src/lib/actions/swipeable.ts

interface SwipeableOptions {
	minDistance?: number;
	maxDuration?: number;
}

const DEFAULTS: Required<SwipeableOptions> = {
	minDistance: 30,
	maxDuration: 500
};

export function swipeable(node: HTMLElement, options?: SwipeableOptions) {
	const { minDistance, maxDuration } = { ...DEFAULTS, ...options };

	let startX = 0;
	let startY = 0;
	let startTime = 0;

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) {
			return;
		}

		startX = event.clientX;
		startY = event.clientY;
		startTime = Date.now();

		node.dispatchEvent(new CustomEvent('swipestart'));

		window.addEventListener('pointerup', handlePointerUp);
	}

	function handlePointerUp(event: PointerEvent) {
		const endX = event.clientX;
		const endY = event.clientY;
		const endTime = Date.now();

		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const duration = endTime - startTime;

		if (duration <= maxDuration) {
			if (Math.abs(deltaY) > minDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
				if (deltaY < 0) {
					node.dispatchEvent(new CustomEvent('swipeup'));
				} else {
					node.dispatchEvent(new CustomEvent('swipedown'));
				}
			} else if (Math.abs(deltaX) > minDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
				if (deltaX < 0) {
					node.dispatchEvent(new CustomEvent('swipeleft'));
				} else {
					node.dispatchEvent(new CustomEvent('swiperight'));
				}
			}
		}

		node.dispatchEvent(new CustomEvent('swipeend'));

		window.removeEventListener('pointerup', handlePointerUp);
	}

	node.addEventListener('pointerdown', handlePointerDown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('pointerup', handlePointerUp);
		}
	};
}
