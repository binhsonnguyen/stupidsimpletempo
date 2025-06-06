import { APP_VERSION } from './version.js';
import * as state from './state.js'
import * as dom from './domElements.js'
import * as audio from './audio.js'
import * as ui from './ui.js'
import { initializeDialControls } from './dialControls.js'

window.addEventListener('DOMContentLoaded', () => {
    // --- Các hàm xử lý và định nghĩa trước ---

    // Hàm này giờ đơn giản hơn vì nó chỉ được gắn vào nút sau khi audio đã sẵn sàng
    function handleStartStopInteraction() {
        console.log('Sự kiện Start/Stop được kích hoạt trên AudioContext đã sẵn sàng.')
        toggleMetronomeState()
    }

    function toggleMetronomeState() {
        if (state.isMetronomeRunning) {
            audio.stopAudio()
        } else {
            audio.startAudio()
        }
        if (ui.setButtonState) {
            ui.setButtonState(state.isMetronomeRunning)
        }
    }

    // --- Giai đoạn 1: Thiết lập trạng thái "Đang tải" và giao diện ban đầu ---
    if (dom.startStopButtonElement) {
        dom.startStopButtonElement.classList.add('loading')
    }

    // Trì hoãn các tác vụ nặng về DOM để trình duyệt có thời gian vẽ lại
    setTimeout(() => {
        if (ui.updateDialVisual) ui.updateDialVisual(state.currentDialRotation)
        if (ui.createTickMarks) ui.createTickMarks()
        if (initializeDialControls) initializeDialControls()
        if (ui.displayAppVersion) ui.displayAppVersion(APP_VERSION)
    }, 0)


    // --- Giai đoạn 2: Tạo một Promise để quản lý trạng thái sẵn sàng của Audio ---
    const audioReadyPromise = new Promise((resolve, reject) => {
        if (!audio.initializeAudioContext()) {
            reject(new Error("AudioContext không được hỗ trợ."))
            return
        }

        const audioCtx = audio.getAudioContext()

        if (audioCtx.state === 'running') {
            console.log("AudioContext đã ở trạng thái running.")
            resolve() // Đã sẵn sàng ngay từ đầu
            return
        }

        // Nếu AudioContext đang suspended, chúng ta cần cử chỉ người dùng để "resolve" promise này
        console.log("AudioContext đang suspended. Đang chờ cử chỉ người dùng để mở khóa...")
        const unlockHandler = () => {
            // Dùng setTimeout(0) để đảm bảo resume() được gọi sau các tác vụ khác một chút
            setTimeout(() => {
                audioCtx.resume().then(() => {
                    resolve() // Audio đã sẵn sàng, hoàn thành Promise
                }).catch(err => {
                    reject(err) // Mở khóa thất bại
                }).finally(() => {
                    // Dọn dẹp listener sau khi đã thử mở khóa
                    document.body.removeEventListener('touchstart', unlockHandler, true)
                    document.body.removeEventListener('click', unlockHandler, true)
                })
            }, 0)
        }

        // Gắn listener vào body để bắt cử chỉ chạm/click đầu tiên
        document.body.addEventListener('touchstart', unlockHandler, { once: true, capture: true })
        document.body.addEventListener('click', unlockHandler, { once: true, capture: true })
    })


    // --- Giai đoạn 3: Xử lý sau khi Audio đã sẵn sàng (hoặc thất bại) ---
    audioReadyPromise.then(() => {
        // Khối .then() này CHỈ CHẠY SAU KHI AudioContext đã resume() thành công
        console.log("Audio đã sẵn sàng! Thiết lập các tương tác cuối cùng.")

        // Chuyển nút từ "đang tải" (xám) sang "sẵn sàng" (xanh lá)
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.classList.remove('loading')
        }
        if (ui.setButtonState) {
            ui.setButtonState(state.isMetronomeRunning) // Thêm class .off
        }

        // Chỉ gắn listener cho nút Start/Stop sau khi mọi thứ đã sẵn sàng
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.addEventListener('click', handleStartStopInteraction)
            dom.startStopButtonElement.addEventListener('touchstart', (event) => {
                event.preventDefault()
                event.stopPropagation()
                handleStartStopInteraction()
            }, { passive: false })
            console.log("Đã gắn listener cho nút Start/Stop.")
        }

    }).catch(err => {
        console.error("Không thể làm cho audio sẵn sàng:", err)
        // Cập nhật giao diện để báo lỗi nếu cần
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.classList.remove('loading')
            dom.startStopButtonElement.classList.add('error') // Ví dụ: một class .error mới với quầng sáng màu vàng
            dom.startStopButtonElement.style.cursor = 'not-allowed'
        }
    })
})