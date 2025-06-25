// src/lib/services/wakeLockService.ts

import { browser } from '$app/environment';
import { logger } from './logger';

let wakeLock: WakeLockSentinel | null = null;

/**
 * Yêu cầu khóa màn hình.
 * Sẽ tự động bỏ qua nếu khóa đã được giữ.
 */
const request = async () => {
	if (!browser || !('wakeLock' in navigator)) {
		return;
	}

	if (wakeLock) {
		return;
	}

	try {
		wakeLock = await navigator.wakeLock.request('screen');
		logger.log('Wake Lock is active.');

		wakeLock.addEventListener('release', () => {
			logger.log('Wake Lock was released by the browser.');
			wakeLock = null;
		});
	} catch (err: any) {
		logger.error(`Wake Lock request failed: ${err.name}`, err);
	}
};

/**
 * Chủ động giải phóng khóa màn hình.
 * (Hữu ích nếu sau này có nút cài đặt để người dùng tự tắt tính năng này).
 */
const release = async () => {
	if (!wakeLock) return;
	try {
		await wakeLock.release();
		wakeLock = null;
		logger.log('Wake Lock released manually.');
	} catch (err: any) {
		logger.error(`Wake Lock release failed: ${err.name}`, err);
	}
};

/**
 * Khởi tạo service.
 * Hàm này nên được gọi một lần duy nhất khi ứng dụng bắt đầu.
 */
const initialize = () => {
	if (!browser || !('wakeLock' in navigator)) {
		logger.warn('Wake Lock API is not supported in this browser.');
		return;
	}

	const handleVisibilityChange = () => {
		if (document.visibilityState === 'visible') {
			// Khi người dùng quay lại, hãy yêu cầu lại khóa.
			request();
		}
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	request();
};

export const wakeLockService = {
	initialize,
	request,
	release
};
