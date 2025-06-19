// /src/ui/components/startButton.ts

// Định nghĩa kiểu cho các trạng thái của nút
export type ButtonState = 'on' | 'off' | 'loading' | 'error';

// Định nghĩa kiểu cho các tham số của constructor
interface StartButtonConstructorParams {
    element: HTMLElement; // Phần tử DOM của nút bấm, bắt buộc
    onTap?: (event?: MouseEvent | TouchEvent) => void; // Hàm callback, có thể không có
}

export class StartButton {
    private element: HTMLElement;
    private onTap: (event?: MouseEvent | TouchEvent) => void;

    constructor({ element, onTap = () => {} }: StartButtonConstructorParams) {
        if (!element) {
            // Mặc dù TypeScript sẽ báo lỗi nếu element không được cung cấp (do kiểu StartButtonConstructorParams),
            // việc kiểm tra runtime vẫn hữu ích để phòng trường hợp JavaScript thuần gọi mà không có kiểm tra kiểu.
            throw new Error('StartButton component yêu cầu có một `element` để hoạt động.');
        }

        this.element = element;
        this.onTap = onTap;

        this._setupListeners();
    }

    // Phương thức "private" để cài đặt các trình lắng nghe sự kiện
    private _setupListeners(): void {
        this.element.addEventListener('click', (event: MouseEvent) => {
            this.onTap(event);
        });

        // Thêm 'touchstart' để phản hồi nhanh hơn trên mobile
        this.element.addEventListener('touchstart', (event: TouchEvent) => {
            // Ngăn hành vi mặc định và "ghost click" có thể xảy ra trên mobile
            event.preventDefault();
            this.onTap(event);
        }, { passive: false }); // passive: false là cần thiết để preventDefault() hoạt động trên touchstart
    }

    /**
     * Thiết lập trạng thái giao diện của nút bấm.
     * @param newState Trạng thái mới của nút.
     */
    public setState(newState: ButtonState): void {
        if (!this.element) return;

        // Xóa tất cả các class trạng thái có thể có trước khi thêm class mới
        // Cách an toàn hơn là chỉ xóa các class trạng thái đã biết
        const possibleStates: ButtonState[] = ['on', 'off', 'loading', 'error'];
        possibleStates.forEach(state => this.element.classList.remove(state));

        // Thêm class mới nếu nó là một trong các trạng thái hợp lệ
        // (Mặc dù kiểu ButtonState đã đảm bảo điều này ở compile time)
        if (possibleStates.includes(newState)) {
            this.element.classList.add(newState);
        }
    }
}
