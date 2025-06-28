// src/lib/state/userInteractionFeedbackStore.ts

import { writable } from 'svelte/store';

// Thời gian chờ (ms) trước khi coi là người dùng đã ngừng tương tác
const INTERACTION_COOLDOWN_MS = 750;

const { subscribe, set } = writable<boolean>(false);

let interactionTimeoutId: number | null = null;

/**
 * Báo hiệu rằng người dùng đã bắt đầu tương tác với một control.
 * Thao tác này sẽ hủy bất kỳ bộ đếm thời gian chờ nào đang có.
 */
function startInteraction() {
	if (interactionTimeoutId) {
		clearTimeout(interactionTimeoutId);
		interactionTimeoutId = null;
	}
	set(true);
}

/**
 * Báo hiệu rằng người dùng đã kết thúc một hành động tương tác.
 * Một bộ đếm thời gian sẽ được bắt đầu. Nếu không có tương tác mới nào
 * trong khoảng thời gian chờ, trạng thái sẽ được đặt lại thành false.
 */
function endInteraction() {
	if (interactionTimeoutId) {
		clearTimeout(interactionTimeoutId);
	}
	interactionTimeoutId = window.setTimeout(() => {
		set(false);
	}, INTERACTION_COOLDOWN_MS);
}

export const userInteractionStore = {
	subscribe,
	startInteraction,
	endInteraction
};