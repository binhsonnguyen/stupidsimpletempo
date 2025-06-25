// src/lib/services/wakeLockService.ts

import { browser } from '$app/environment';
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

export const wakeLockService = {
	request,
	release
};