// src/lib/components/dial/actions/doubleTappable.ts

import { userInteractionStore } from '$lib/state/userInteractionFeedbackStore';

interface DoubleTapOptions {
	timeout?: number;
	maxDistance?: number;
}

const DEFAULTS: Required<DoubleTapOptions> = {
	timeout: 300, // ms
	maxDistance: 25 // px
};

export function doubleTappable(node: HTMLElement, options?: DoubleTapOptions) {
	const { timeout, maxDistance } = { ...DEFAULTS, ...options };

	let lastTapTime = 0;
	let lastTapX = 0;
	let lastTapY = 0;

	function handlePointerDown(event: PointerEvent) {
		if ((event.target as Element).closest('.start-stop-button')) {
			return;
		}

		if (event.button !== 0) return;

		const now = Date.now();
		const { clientX, clientY } = event;

		const timeSinceLastTap = now - lastTapTime;
		const distance = Math.sqrt((clientX - lastTapX) ** 2 + (clientY - lastTapY) ** 2);

		if (timeSinceLastTap < timeout && distance < maxDistance) {
			userInteractionStore.startInteraction();

			const rect = node.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const relX = lastTapX - centerX;
			const relY = lastTapY - centerY;
			const angle = Math.atan2(relY, relX) * (180 / Math.PI);

			node.dispatchEvent(new CustomEvent('doubletap', { detail: { angle } }));

			userInteractionStore.endInteraction();

			lastTapTime = 0;
		} else {
			lastTapTime = now;
			lastTapX = clientX;
			lastTapY = clientY;
		}
	}

	node.addEventListener('pointerdown', handlePointerDown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
		}
	};
}
