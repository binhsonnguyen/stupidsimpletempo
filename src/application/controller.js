/**
 * Module này chứa các hàm xử lý (handlers) cấp cao,
 * được các component giao diện gọi khi có tương tác của người dùng.
 * Các hàm này kết nối hành động của người dùng với các use case của ứng dụng.
 */

/**
 * Xử lý sự kiện khi StartButton được nhấn.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 */
export function handleButtonTap ({ useCases, presenter, audioService }) {
    const audioCtx = audioService.getAudioContext()

    const performToggle = () => {
        useCases.toggleMetronome()
        presenter.renderApp()
    }

    // Xử lý việc "mở khóa" AudioContext trên trình duyệt
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(performToggle)
    } else if (audioCtx && audioCtx.state === 'running') {
        performToggle()
    } else if (!audioCtx) {
        if (audioService.initializeAudioContext()) {
            handleButtonTap({ useCases, presenter, audioService })
        }
    }
}

/**
 * Xử lý sự kiện khi góc của Dial bị thay đổi.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 * @param {number} newAngle - Góc mới do Dial cung cấp.
 */
export function handleAngleChanged ({ useCases, presenter }, newAngle) {
    useCases.changeBpmFromAngle(newAngle)
    presenter.renderApp()
}