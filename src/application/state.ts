// /src/application/state.ts
import * as config from '@/infrastructure/config'; // Đã là .ts, import các giá trị với kiểu
import { logger } from "@/infrastructure/logger";   // Đã là .ts, logger nên có kiểu

// 1. Định nghĩa kiểu cho state object
interface AppState {
    currentBpm: number;
    isMetronomeRunning: boolean;
    currentDialRotation: number;
    wakeLockSentinel: WakeLockSentinel | null;
}

// Đóng gói toàn bộ state vào một object riêng tư, không export ra ngoài.
const state: AppState = {
    currentBpm: config.MIN_SCALE_BPM,
    isMetronomeRunning: false,
    currentDialRotation: 0,
    wakeLockSentinel: null,
};

// --- GETTERS (Hàm để lấy state) ---
// Chỉ cung cấp các hàm "getter" để đọc state, ngăn chặn việc sửa đổi trực tiếp từ bên ngoài.

export const getCurrentBpm = (): number => state.currentBpm;
export const getIsMetronomeRunning = (): boolean => state.isMetronomeRunning;
export const getWakeLockSentinel = (): WakeLockSentinel | null => state.wakeLockSentinel;
export const getCurrentDialRotation = (): number => state.currentDialRotation;

/**
 * Tính toán và trả về góc hiệu dụng của núm xoay trên thang đo (0-360 độ).
 * Giá trị này được tính toán "on-the-fly" từ `currentDialRotation` để đảm bảo luôn đồng bộ.
 * @returns {number} Góc hiệu dụng, đã được chuẩn hóa trong khoảng [0, 360).
 */
export function getEffectiveKnobAngleOnDialScale(): number {
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
 * @param newBpm - Giá trị BPM mới.
 */
export function setCurrentBpm(newBpm: number): void {
    state.currentBpm = Math.max(config.MIN_SCALE_BPM, Math.min(config.MAX_SCALE_BPM, newBpm));
}

/**
 * Cập nhật trạng thái chạy/dừng của metronome.
 * @param running - `true` nếu đang chạy, `false` nếu đã dừng.
 */
export function setIsMetronomeRunning(running: boolean): void {
    state.isMetronomeRunning = running;
}

/**
 * Lưu trữ đối tượng WakeLockSentinel.
 * @param sentinel - Đối tượng sentinel trả về từ Wake Lock API.
 */
export function setWakeLockSentinel(sentinel: WakeLockSentinel | null): void {
    state.wakeLockSentinel = sentinel;
}

/**
 * Cập nhật giá trị góc xoay thô của núm vặn.
 * @param rotation - Giá trị góc xoay mới.
 */
export function setCurrentDialRotation(rotation: number): void {
    state.currentDialRotation = rotation;

    // Khi ghi log, gọi hàm getter để lấy giá trị góc hiệu dụng đã được tính toán
    logger.log(`Rotation State Updated -> raw: ${rotation.toFixed(2)}, effective: ${getEffectiveKnobAngleOnDialScale().toFixed(2)}`);
}