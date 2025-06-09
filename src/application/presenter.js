import { logger } from '../infrastructure/logger.js'

// Các biến cục bộ để giữ tham chiếu đến các phụ thuộc
let metronome = null
let startButton = null // Sẽ giữ tham chiếu đến thực thể của StartButton component

export function initializePresenter (dependencies) {
    metronome = dependencies.metronome
    // Presenter sẽ được 'tiêm' thực thể của component sau khi nó được tạo ra
    startButton = dependencies.startButton
}

/**
 * Hàm render chính, được gọi mỗi khi có sự thay đổi trạng thái cần cập nhật ra UI.
 */
export function renderApp () {
    if (!metronome) return

    // Presenter ra lệnh cho StartButton component tự cập nhật trạng thái của nó
    if (startButton) {
        const buttonState = metronome.isRunning ? 'on' : 'off'
        startButton.setState(buttonState)
    }

    // Logic cập nhật dial không còn ở đây, vì Dial component tự quản lý
    logger.log(`BPM: ${metronome.bpm} | Running: ${metronome.isRunning}`)
}

/**
 * Hàm chỉ chạy một lần lúc đầu để vẽ các thành phần UI tĩnh.
 */
export function renderInitialUi (dependencies, appVersion) {
    const { view } = dependencies
    if (!view) return

    view.createTickMarks()
    view.displayAppVersion(appVersion)

    // Gọi renderApp lần đầu để đảm bảo nút bấm có đúng trạng thái 'off' ban đầu
    renderApp()
}