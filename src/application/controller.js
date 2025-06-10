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
    const performToggle = () => {
        useCases.toggleMetronome()
        presenter.renderApp()
    }

    let audioCtx = audioService.getAudioContext()

    if (!audioCtx) {
        if (audioService.initializeAudioContext()) {
            audioCtx = audioService.getAudioContext() // Lấy lại context sau khi khởi tạo
        }
    }

    if (audioCtx) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                if (audioService.getAudioContext().state === 'running') {
                    performToggle() // Thực hiện công việc chính
                } else {
                    console.warn('AudioContext resumed but state is not "running". Metronome may not start.')
                }
            }).catch(err => {
                console.error('Error resuming AudioContext:', err)
            })
        } else if (audioCtx.state === 'running') {
            performToggle()
        } else {
            console.warn(`AudioContext is in an unexpected state: ${audioCtx.state}`)
        }
    } else {
        console.error('Failed to initialize or get AudioContext. Metronome cannot start.')
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