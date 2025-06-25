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

	function handleTouchStart(event: TouchEvent) {
		const touch = event.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
	}

	function handleTouchEnd(event: TouchEvent) {
		const touch = event.changedTouches[0];
		const endX = touch.clientX;
		const endY = touch.clientY;
		const endTime = Date.now();

		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const duration = endTime - startTime;

		if (duration > maxDuration) {
			return;
		}

		if (Math.abs(deltaY) > minDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
			if (deltaY < 0) {
				node.dispatchEvent(new CustomEvent('swipeup'));
			} else {
				node.dispatchEvent(new CustomEvent('swipedown'));
			}
		}
	}

	node.addEventListener('touchstart', handleTouchStart, { passive: true });
	node.addEventListener('touchend', handleTouchEnd, { passive: true });

	return {
		destroy() {
			node.removeEventListener('touchstart', handleTouchStart);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	};
}