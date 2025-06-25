// src/lib/services/wakeLockManager.ts

import { browser } from '$app/environment';
import { metronomeStore } from '$lib/state/metronomeStore';
import { wakeLockService } from './wakeLockService';
import { logger } from './logger';

let isMetronomeRunning = false;
let isTabVisible = true;

let unsubscribeFromMetronome: (() => void) | null = null;

/**
 * Hàm trung tâm ra quyết định.
 * Dựa trên trạng thái hiện tại, nó sẽ yêu cầu hoặc giải phóng khóa.
 */
function updateWakeLockState() {
	if (isMetronomeRunning && isTabVisible) {
		logger.log('Manager: Conditions met, requesting wake lock.');
		wakeLockService.request();
	} else {
		logger.log('Manager: Conditions not met, releasing wake lock.');
		wakeLockService.release();
	}
}

/**
 * Xử lý khi trạng thái hiển thị của tab thay đổi.
 */
function handleVisibilityChange() {
	if (!browser) return;
	isTabVisible = document.visibilityState === 'visible';
	updateWakeLockState();
}

/**
 * Khởi tạo manager.
 * Hàm này nên được gọi một lần duy nhất khi ứng dụng bắt đầu.
 */
function initialize() {
	if (!browser) return;

	logger.log('Wake Lock Manager initialized.');

	document.addEventListener('visibilitychange', handleVisibilityChange);

	unsubscribeFromMetronome = metronomeStore.subscribe((state) => {
		isMetronomeRunning = state.isRunning;
		updateWakeLockState();
	});

	isTabVisible = document.visibilityState === 'visible';
}

/**
 * Dọn dẹp các listener khi ứng dụng bị hủy.
 * Rất quan trọng để tránh rò rỉ bộ nhớ.
 */
function destroy() {
	if (!browser) return;

	logger.log('Wake Lock Manager destroyed.');

	document.removeEventListener('visibilitychange', handleVisibilityChange);
	if (unsubscribeFromMetronome) {
		unsubscribeFromMetronome();
	}

	wakeLockService.release();
}

export const wakeLockManager = {
	initialize,
	destroy
};