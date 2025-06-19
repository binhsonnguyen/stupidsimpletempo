// /src/infrastructure/services/wakeLockService.ts
import { logger } from "../logger"; // Giả sử logger.ts tồn tại và export logger

// WakeLockSentinel là một kiểu có sẵn trong DOM typings của TypeScript
let sentinel: WakeLockSentinel | null = null;

export interface WakeLockServiceInterface {
    request: () => Promise<void>;
    release: () => Promise<void>;
}

export const wakeLockService: WakeLockServiceInterface = {
    async request(): Promise<void> {
        logger.log('request wakeLock');
        // Kiểm tra xem wakeLock có trong navigator và sentinel có null không
        if ('wakeLock' in navigator && sentinel === null) {
            try {
                // navigator.wakeLock có thể không tồn tại, cần kiểm tra kỹ hơn hoặc dùng type assertion
                // Tuy nhiên, 'wakeLock' in navigator đã kiểm tra sự tồn tại của thuộc tính.
                // TypeScript vẫn có thể cảnh báo nếu navigator không được mở rộng để bao gồm wakeLock.
                // Một cách để xử lý là ép kiểu navigator nếu cần: (navigator as any).wakeLock
                // Hoặc tốt hơn là mở rộng interface Navigator nếu bạn dùng thường xuyên.
                sentinel = await navigator.wakeLock.request('screen');
                logger.log('Wake lock requested successfully.');

                sentinel.addEventListener('release', () => {
                    logger.log('Wake lock was released.');
                    sentinel = null; // Đặt lại sentinel khi nó được giải phóng
                });
            } catch (err: unknown) { // Sử dụng unknown cho lỗi và kiểm tra kiểu sau đó
                if (err instanceof Error) {
                    logger.error(`WakeLock request failed: ${err.name}, ${err.message}`);
                } else {
                    logger.error('WakeLock request failed with an unknown error type.');
                }
                // sentinel vẫn sẽ là null nếu request thất bại
            }
        } else if (sentinel !== null) {
            logger.log('Wake lock already active.');
        } else if (!('wakeLock' in navigator)) {
            logger.warn('WakeLock API not supported by this browser.');
        }
    },

    async release(): Promise<void> {
        logger.log('release wakeLock');
        if (sentinel) {
            try {
                await sentinel.release();
                // sentinel sẽ được đặt thành null bởi event listener 'release' ở trên
                // nhưng để chắc chắn, ta có thể đặt lại ở đây nếu listener chưa kịp chạy
                // hoặc nếu release() được gọi mà không qua event.
                // Tuy nhiên, theo MDN, sau khi sentinel.release() được gọi,
                // sự kiện 'release' sẽ được kích hoạt trên sentinel.
                // sentinel = null; // Dòng này có thể không cần thiết nếu event listener hoạt động đúng
            } catch (err: unknown) {
                if (err instanceof Error) {
                    logger.error(`WakeLock release failed: ${err.name}, ${err.message}`);
                } else {
                    logger.error('WakeLock release failed with an unknown error type.');
                }
            }
        } else {
            logger.log('No active wake lock to release.');
        }
    }
};