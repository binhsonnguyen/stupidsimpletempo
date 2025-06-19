// /src/application/presenter.ts
import { logger } from '@/infrastructure/logger'; // Giả sử logger.ts export logger với kiểu phù hợp
import { dom } from '@/ui/domElements'; // Giả sử domElements.ts export dom với các HTMLElement đã được định kiểu

// Import các kiểu cần thiết
import { Metronome } from '@/core/domain/metronome'; // Đường dẫn đến Metronome class
import { StartButton, ButtonState } from '@/ui/components/startButton'; // Đường dẫn đến StartButton class và ButtonState type

// Định nghĩa kiểu cho các biến ở phạm vi module
let metronome: Metronome | null = null;
let startButton: StartButton | null = null;

// Định nghĩa kiểu cho đối tượng dependencies được truyền vào
// Interface này nên được định nghĩa ở một nơi chung (ví dụ: trong container.ts hoặc một tệp types.ts riêng)
// và import vào đây nếu presenter.ts không phải là nơi duy nhất sử dụng nó.
// Dựa trên container.ts, chúng ta có thể sử dụng DependenciesWithUIComponents
export interface PresenterDependencies {
    metronome: Metronome;
    startButton: StartButton;
    // Thêm các dependencies khác mà presenter có thể cần từ container
    // ví dụ: dial: Dial; (nếu presenter tương tác trực tiếp với Dial)
}

/**
 * Khởi tạo presenter với các dependencies cần thiết.
 * @param dependencies Các đối tượng phụ thuộc.
 */
export function initializePresenter(dependencies: PresenterDependencies): void {
    metronome = dependencies.metronome;
    startButton = dependencies.startButton;
}

/**
 * Cập nhật giao diện người dùng dựa trên trạng thái hiện tại của ứng dụng.
 */
export function renderApp(): void {
    if (!metronome) {
        logger.warn('Presenter: Metronome chưa được khởi tạo khi gọi renderApp.');
        return;
    }

    if (startButton) {
        const buttonState: ButtonState = metronome.isRunning ? 'on' : 'off';
        startButton.setState(buttonState);
    }

    // Có thể bạn muốn hiển thị BPM và trạng thái isRunning lên UI ở đây thay vì chỉ log
    // Ví dụ: if (dom.bpmDisplayElement) dom.bpmDisplayElement.textContent = metronome.bpm.toString();
    //        if (dom.statusDisplayElement) dom.statusDisplayElement.textContent = metronome.isRunning ? 'Đang chạy' : 'Đã dừng';

    logger.log(`BPM: ${metronome.bpm} | Running: ${metronome.isRunning}`);
}

/**
 * Hiển thị giao diện người dùng ban đầu, bao gồm phiên bản ứng dụng.
 * @param dependencies Các đối tượng phụ thuộc (có thể không cần thiết nếu initializePresenter đã được gọi).
 * @param appVersion Chuỗi phiên bản của ứng dụng.
 */
export function renderInitialUi(dependencies: PresenterDependencies, appVersion?: string): void {
    // Nếu initializePresenter luôn được gọi trước renderInitialUi,
    // bạn có thể không cần truyền dependencies vào đây nữa và sử dụng
    // các biến metronome, startButton ở phạm vi module.
    // Tuy nhiên, để giữ tính nhất quán với file JS gốc, chúng ta vẫn truyền vào.
    // Nếu bạn quyết định bỏ dependencies ở đây, hãy đảm bảo initializePresenter được gọi trước.

    if (dom.appVersionElement) {
    // Kiểm tra appVersion rõ ràng hơn
    if (appVersion && appVersion.trim() !== '') {
        dom.appVersionElement.textContent = appVersion;
    } else {
        dom.appVersionElement.textContent = 'N/A';
    }
}
renderApp(); // Gọi renderApp để cập nhật các phần còn lại của UI
}