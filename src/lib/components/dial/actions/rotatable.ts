// src/lib/components/dial/actions/rotatable.ts

type RotatableOptions = {
	rotation: number;
};

export function rotatable(node: HTMLElement, options: RotatableOptions) {
	let rotation = options.rotation;
	let startAngle = 0;
	let startRotation = 0;

	function getAngle(clientX: number, clientY: number): number {
		const rect = node.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const dx = clientX - centerX;
		const dy = clientY - centerY;
		return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
	}

	function getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
		if ('touches' in event) {
			return { x: event.touches[0].clientX, y: event.touches[0].clientY };
		}
		return { x: event.clientX, y: event.clientY };
	}

	function handleDragStart(event: MouseEvent | TouchEvent) {
		if ((event.target as Element).closest('.start-stop-button')) {
			return;
		}
		event.preventDefault();

		const { x, y } = getEventCoordinates(event);
		startAngle = getAngle(x, y);
		startRotation = rotation;

		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
		window.addEventListener('touchmove', handleDragMove, { passive: false });
		window.addEventListener('touchend', handleDragEnd);
		window.addEventListener('touchcancel', handleDragEnd);
	}

	function handleDragMove(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const { x, y } = getEventCoordinates(event);
		const currentAngle = getAngle(x, y);
		let deltaAngle = currentAngle - startAngle;

		if (deltaAngle > 180) deltaAngle -= 360;
		else if (deltaAngle < -180) deltaAngle += 360;

		node.dispatchEvent(new CustomEvent('rotate', { detail: startRotation + deltaAngle }));
	}

	function handleDragEnd() {
		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
		window.removeEventListener('touchmove', handleDragMove);
		window.removeEventListener('touchend', handleDragEnd);
		window.removeEventListener('touchcancel', handleDragEnd);

		node.dispatchEvent(new CustomEvent('dragend'));
	}

	node.addEventListener('mousedown', handleDragStart);
	node.addEventListener('touchstart', handleDragStart);

	return {
		update(newOptions: RotatableOptions) {
			rotation = newOptions.rotation;
		},
		destroy() {
			node.removeEventListener('mousedown', handleDragStart);
			node.removeEventListener('touchstart', handleDragStart);
			handleDragEnd();
		}
	};
}