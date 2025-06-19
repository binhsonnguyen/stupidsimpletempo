// /src/ui/controllers/controller.ts

// Giả định rằng bạn có các interface này được định nghĩa ở đâu đó,
// ví dụ: trong các tệp useCases.ts và presenter.ts tương ứng.
// Nếu chưa có, bạn cần tạo chúng.

interface UseCasesInterface {
    toggleMetronome: () => void;
    changeBpm: (bpm: number) => void;
    // Thêm các phương thức use case khác nếu có
}

interface PresenterInterface {
    renderApp: () => void;
    // Thêm các phương thức presenter khác nếu có
}

interface ControllerDependencies {
    useCases: UseCasesInterface;
    presenter: PresenterInterface;
}

/**
 * Xử lý sự kiện khi StartButton được nhấn.
 * @param {ControllerDependencies} dependencies - Các phụ thuộc cần thiết.
 */
export async function handleButtonTap({ useCases, presenter }: ControllerDependencies): Promise<void> {
    useCases.toggleMetronome();
    presenter.renderApp();
}

/**
 * Xử lý sự kiện khi góc của Dial bị thay đổi.
 * @param {ControllerDependencies} dependencies - Các phụ thuộc cần thiết.
 * @param {number | undefined} newBpmValue - Giá trị BPM mới do Dial cung cấp.
 */
export function handleDialChanged(
    { useCases, presenter }: ControllerDependencies,
    newBpmValue: number | undefined
): void {
    if (newBpmValue === undefined) {
        return;
    }

    useCases.changeBpm(newBpmValue);
    presenter.renderApp();

    // Kiểm tra navigator.vibrate có tồn tại không trước khi gọi
    if (navigator.vibrate) {
        try {
            navigator.vibrate(10);
        } catch (error) {
            // Một số trình duyệt có thể throw lỗi nếu vibrate không được phép hoặc không được hỗ trợ đúng cách
            console.warn("navigator.vibrate call failed:", error);
        }
    }
}