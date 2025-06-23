// /src/infrastructure/logger.ts

export type LogLevel = 'log' | 'warn' | 'error';

// Tham chiếu đến phần tử DOM nơi log sẽ hiển thị
let uiLogElement: HTMLElement | null = null;
// Cờ để kiểm soát việc ghi log ra UI
let isUiLoggingEnabled: boolean = false;
// Giới hạn số lượng dòng log hiển thị để tránh làm chậm trình duyệt
const MAX_UI_LOGS = 100;

/**
 * Thiết lập phần tử DOM để hiển thị log và bật/tắt tính năng này.
 * @param element Phần tử DOM để hiển thị log (hoặc null để xóa).
 * @param enable Bật (true) hoặc tắt (false) tính năng ghi log ra UI.
 */
export function setUiLogElement(element: HTMLElement | null, enable: boolean): void {
    uiLogElement = element;
    isUiLoggingEnabled = enable;
    if (uiLogElement && isUiLoggingEnabled) {
        // Xóa nội dung cũ khi bật lại
        uiLogElement.innerHTML = '';
        // Ghi một dòng log thông báo đã bật UI logging
        appendLogToUi('UI logging enabled.', 'log');
    } else if (uiLogElement) {
        // Tùy chọn: Xóa nội dung khi tắt
        uiLogElement.innerHTML = '';
    }
}

/**
 * Hàm nội bộ để thêm dòng log vào phần tử UI.
 * @param message Nội dung chính của log.
 * @param level Cấp độ log ('log', 'warn', 'error').
 * @param args Các đối số bổ sung được truyền cho console.log.
 */
function appendLogToUi(message: string, level: LogLevel, args: any[] = []): void {
    if (!uiLogElement || !isUiLoggingEnabled) {
        return;
    }

    // Định dạng dòng log
    const timestamp = new Date().toLocaleTimeString();
    // Chuyển đổi các đối số bổ sung thành chuỗi JSON hoặc chuỗi thông thường
    const argsString = args.map(arg => {
        try {
            return JSON.stringify(arg);
        } catch {
            return String(arg);
        }
    }).join(', ');

    const formattedMessage = `${timestamp} [${level.toUpperCase()}] ${message}${argsString ? ' ' + argsString : ''}`;

    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry', `log-${level}`); // Thêm class để tạo kiểu CSS
    logEntry.textContent = formattedMessage; // Sử dụng textContent để tránh vấn đề bảo mật (XSS)

    // Thêm dòng log mới vào đầu (hiển thị dòng mới nhất ở trên cùng)
    uiLogElement.prepend(logEntry);

    // Giới hạn số lượng dòng log
    while (uiLogElement.children.length > MAX_UI_LOGS) {
        uiLogElement.removeChild(uiLogElement.lastChild as Node);
    }
}

// Đối tượng logger được export, giờ đây gọi cả console và appendLogToUi
export const logger = {
    log: (message: string, ...args: any[]) => {
        console.log(message, ...args);
        appendLogToUi(message, 'log', args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(message, ...args);
        appendLogToUi(message, 'warn', args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(message, ...args);
        appendLogToUi(message, 'error', args);
    },
};