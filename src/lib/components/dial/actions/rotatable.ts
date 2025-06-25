// src/lib/components/dial/actions/rotatable.ts

type RotatableOptions = {
	rotation: number;
};

const DRAG_THRESHOLD = 1;

class DragStateManager {
	private _startX: number = 0;
	private _startY: number = 0;
	private _isDragging: boolean = false;
	private _hasCrossedThreshold: boolean = false;

	constructor(private threshold: number) {}

	private getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
		if ('touches' in event) {
			return { x: event.touches[0].clientX, y: event.touches[0].clientY };
		}
		return { x: event.clientX, y: event.clientY };
	}

	/**
	 * Khởi tạo trạng thái kéo khi sự kiện mousedown/touchstart xảy ra.
	 * @param event Sự kiện chuột hoặc chạm.
	 */
	start(event: MouseEvent | TouchEvent): void {
		const coords = this.getEventCoordinates(event);
		this._startX = coords.x;
		this._startY = coords.y;
		this._isDragging = false;
		this._hasCrossedThreshold = false;
	}

	/**
	 * Cập nhật trạng thái kéo khi sự kiện mousemove/touchmove xảy ra.
	 * Kiểm tra ngưỡng kéo và cập nhật trạng thái isDragging.
	 * @param event Sự kiện chuột hoặc chạm.
	 * @returns Một đối tượng chứa tọa độ hiện tại và cờ `justCrossedThreshold` (true nếu vừa vượt ngưỡng).
	 */
	update(event: MouseEvent | TouchEvent): { x: number; y: number; justCrossedThreshold: boolean } {
		const coords = this.getEventCoordinates(event);
		const currentX = coords.x;
		const currentY = coords.y;
		let justCrossedThreshold = false;

		if (!this._hasCrossedThreshold) {
			const dx = currentX - this._startX;
			const dy = currentY - this._startY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance >= this.threshold) {
				this._hasCrossedThreshold = true;
				this._isDragging = true;
				justCrossedThreshold = true;
			}
		}

		return {
			x: currentX,
			y: currentY,
			justCrossedThreshold: justCrossedThreshold
		};
	}

	/**
	 * Kết thúc hành động kéo, reset trạng thái.
	 */
	end(): void {
		this._isDragging = false;
		this._hasCrossedThreshold = false;
	}

	/**
	 * Trả về trạng thái hiện tại của việc kéo (đã vượt ngưỡng và đang kéo).
	 */
	get isDragging(): boolean {
		return this._isDragging;
	}
}


export function rotatable(node: HTMLElement, options: RotatableOptions) {
	let rotation = options.rotation;
	let startAngle = 0;
	let startRotation = 0;

	const dragStateManager = new DragStateManager(DRAG_THRESHOLD);

	function getAngle(clientX: number, clientY: number): number {
		const rect = node.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const dx = clientX - centerX;
		const dy = clientY - centerY;
		return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
	}

	function handleDragStart(event: MouseEvent | TouchEvent) {
		if ((event.target as Element).closest('.start-stop-button')) {
			return;
		}
		event.preventDefault();

		dragStateManager.start(event);
		startRotation = rotation;

		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
		window.addEventListener('touchmove', handleDragMove, { passive: false });
		window.addEventListener('touchend', handleDragEnd);
		window.addEventListener('touchcancel', handleDragEnd);
	}

	function handleDragMove(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const { x, y, justCrossedThreshold } = dragStateManager.update(event);

		if (justCrossedThreshold) {
			startAngle = getAngle(x, y);
		}

		if (!dragStateManager.isDragging) {
			return;
		}

		const currentAngle = getAngle(x, y);
		let deltaAngle = currentAngle - startAngle;

		if (deltaAngle > 180) deltaAngle -= 360;
		else if (deltaAngle < -180) deltaAngle += 360;

		node.dispatchEvent(new CustomEvent('rotate', { detail: startRotation + deltaAngle }));
	}

	function handleDragEnd() {
		if (dragStateManager.isDragging) {
			node.dispatchEvent(new CustomEvent('dragend'));
		}

		dragStateManager.end();

		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
		window.removeEventListener('touchmove', handleDragMove);
		window.removeEventListener('touchend', handleDragEnd);
		window.removeEventListener('touchcancel', handleDragEnd);
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