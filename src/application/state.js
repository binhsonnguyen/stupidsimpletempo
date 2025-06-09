// infrastructure/config.js và infrastructure/logger.js giữ nguyên
import * as config from '../infrastructure/config.js';
import { logger } from "../infrastructure/logger.js";

/**
 * @typedef {import('screen-wake-lock').WakeLockSentinel} WakeLockSentinel
 */

// 1. Đóng gói toàn bộ state vào một object riêng tư, không export ra ngoài.
const state = {
    currentBpm: config.MIN_SCALE_BPM,
    isMetronomeRunning: false,
    currentDialRotation: 0,
    /** @type {WakeLockSentinel | null} */
    wakeLockSentinel: null,
};

// --- GETTERS (Hàm để lấy state) ---
// Chỉ cung cấp các hàm "getter" để đọc state, ngăn chặn việc sửa đổi trực tiếp từ bên ngoài.

export const getCurrentBpm = () => state.currentBpm;
export const getIsMetronomeRunning = () => state.isMetronomeRunning;
export const getWakeLockSentinel = () => state.wakeLockSentinel;
export const getCurrentDialRotation = () => state.currentDialRotation;

/**
 * Tính toán và trả về góc hiệu dụng của núm xoay trên thang đo (0-360 độ).
 * Giá trị này được tính toán "on-the-fly" từ `currentDialRotation` để đảm bảo luôn đồng bộ.
 * @returns {number} Góc hiệu dụng, đã được chuẩn hóa trong khoảng [0, 360).
 */
export function getEffectiveKnobAngleOnDialScale() {
    let normalizedAngle = -state.currentDialRotation % 360;

    // Đảm bảo góc luôn là số dương
    if (normalizedAngle < 0) {
        normalizedAngle += 360;
    }

    return normalizedAngle;
}

// --- SETTERS (Hàm để cập nhật state) ---
// Các hàm "setter" là cổng duy nhất để thay đổi state, cho phép thêm logic kiểm tra hoặc xử lý.

/**
 * Cập nhật BPM hiện tại, đảm bảo giá trị nằm trong khoảng MIN và MAX đã cấu hình.
 * @param {number} newBpm - Giá trị BPM mới.
 */
export function setCurrentBpm(newBpm) {
    state.currentBpm = Math.max(config.MIN_SCALE_BPM, Math.min(config.MAX_SCALE_BPM, newBpm));
}

/**
 * Cập nhật trạng thái chạy/dừng của metronome.
 * @param {boolean} running - `true` nếu đang chạy, `false` nếu đã dừng.
 */
export function setIsMetronomeRunning(running) {
    state.isMetronomeRunning = running;
}

/**
 * Lưu trữ đối tượng WakeLockSentinel.
 * @param {WakeLockSentinel | null} sentinel - Đối tượng sentinel trả về từ Wake Lock API.
 */
export function setWakeLockSentinel(sentinel) {
    state.wakeLockSentinel = sentinel;
}

/**
 * Cập nhật giá trị góc xoay thô của núm vặn.
 * @param {number} rotation - Giá trị góc xoay mới.
 */
export function setCurrentDialRotation(rotation) {
    state.currentDialRotation = rotation;

    // Khi ghi log, gọi hàm getter để lấy giá trị góc hiệu dụng đã được tính toán
    logger.log(`Rotation State Updated -> raw: ${rotation.toFixed(2)}, effective: ${getEffectiveKnobAngleOnDialScale().toFixed(2)}`);
}