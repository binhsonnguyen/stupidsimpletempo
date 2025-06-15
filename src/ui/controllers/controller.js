/**
 * Module này chứa các hàm xử lý (handlers) cấp cao,
 * được các component giao diện gọi khi có tương tác của người dùng.
 * Các hàm này kết nối hành động của người dùng với các use case của ứng dụng.
 */

/**
 * Xử lý sự kiện khi StartButton được nhấn.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 */
export async function handleButtonTap ({ useCases, presenter }) {
    useCases.toggleMetronome()
    presenter.renderApp()
}

/**
 * Xử lý sự kiện khi góc của Dial bị thay đổi.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 * @param {newBpmValue} newBpmValue - Giá trị BPM mới do Dial cung cấp.
 */
export function handleDialChanged ({ useCases, presenter }, newBpmValue) {
    if (newBpmValue === undefined) {
        return;
    }
    useCases.changeBpm(newBpmValue)
    presenter.renderApp()
}
