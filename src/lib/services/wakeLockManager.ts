// src/lib/services/wakeLockManager.ts

import { browser } from '$app/environment';
import { metronomeStore } from '$lib/state/metronomeStore';
import { logger } from './logger';

let wakeLock: WakeLockSentinel | null = null;

/**
 * Yêu cầu khóa màn hình.
 */
const request = async () => {
	if (!browser || !('wakeLock' in navigator)) {
		logger.warn('WakeLock API not supported.');
		return;
	}
	if (wakeLock) {
		logger.log('Wake Lock already active, request ignored.');
		return;
	}

	try {
		wakeLock = await navigator.wakeLock.request('screen');
		logger.log('Wake Lock has been successfully acquired.');

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
 */
const release = async () => {
	if (!wakeLock) return;
	try {
		const lockToRelease = wakeLock;
		wakeLock = null;
		await lockToRelease.release();
		logger.log('Wake Lock released manually.');
	} catch (err: any) {
		logger.error(`Wake Lock release failed: ${err.name}`, err);
	}
};

let isMetronomeRunning = false;
let isTabVisible = true;

let unsubscribeFromMetronome: (() => void) | null = null;

/**
 * Hàm trung tâm ra quyết định.
 */
function updateWakeLockState() {
	if (isMetronomeRunning && isTabVisible) {
		logger.log('Manager: Conditions met, requesting wake lock.');
		request();
	} else {
		logger.log('Manager: Conditions not met, releasing wake lock.');
		release();
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
 */
function destroy() {
	if (!browser) return;

	logger.log('Wake Lock Manager destroyed.');

	document.removeEventListener('visibilitychange', handleVisibilityChange);
	if (unsubscribeFromMetronome) {
		unsubscribeFromMetronome();
	}

	release();
}

export const wakeLockManager = {
	initialize,
	destroy
};