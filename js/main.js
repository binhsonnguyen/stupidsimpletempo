import * as state from './state.js'
import * as dom from './domElements.js'
import * as audio from './audio.js'
import * as ui from './ui.js'
import { initializeDialControls } from './dialControls.js'


window.addEventListener('DOMContentLoaded', () => {
    ui.updateDialVisual(state.currentDialRotation)
    ui.setButtonState(state.isMetronomeRunning)
    ui.createTickMarks()
    initializeDialControls()

    dom.startStopButtonElement.addEventListener('click', () => {
        if (!audio.initializeAudioContext()) { // Đảm bảo context được khởi tạo trước khi sử dụng
            return // Không thể khởi tạo audio context
        }

        if (state.isMetronomeRunning) {
            audio.stopAudio()
        } else {
            audio.startAudio()
        }
        ui.setButtonState(state.isMetronomeRunning) // Cập nhật trạng thái nút sau khi thay đổi state
    })
})