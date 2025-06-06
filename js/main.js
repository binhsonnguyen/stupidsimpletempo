import { APP_VERSION } from './version.js';
import * as state from './state.js'
import * as dom from './domElements.js'
import * as audio from './audio.js'
import * as ui from './ui.js'
import { initializeDialControls } from './dialControls.js'

window.addEventListener('DOMContentLoaded', () => {
    // --- Giai đoạn 1: Thiết lập trạng thái "Đang tải" ngay lập tức ---
    if (dom.startStopButtonElement) {
        dom.startStopButtonElement.classList.add('loading')
    }

    // --- Giai đoạn 2: Chạy các tác vụ khởi tạo (có thể mất thời gian) ---
    // Các hàm này đồng bộ, sẽ chạy lần lượt
    if (ui.updateDialVisual) {
        ui.updateDialVisual(state.currentDialRotation)
    }
    if (ui.createTickMarks) {
        ui.createTickMarks() // Đây là phần có thể gây trễ
    }
    if (initializeDialControls) {
        initializeDialControls()
    }

    // --- Giai đoạn 3: Ứng dụng đã sẵn sàng, thiết lập trạng thái cuối cùng ---
    if (dom.startStopButtonElement) {
        dom.startStopButtonElement.classList.remove('loading') // Bỏ trạng thái loading
    }
    if (ui.setButtonState) {
        ui.setButtonState(state.isMetronomeRunning) // Đặt trạng thái ban đầu (sẽ là .off - màu xanh lá)
    }

    // --- Giai đoạn 4: Gắn các trình xử lý sự kiện khi ứng dụng đã sẵn sàng ---
    function handleStartStopInteraction() {
        console.log('Sự kiện Start/Stop được kích hoạt')
        if (!audio.initializeAudioContext()) {
            console.error('Không thể khởi tạo AudioContext trong handleStartStopInteraction.')
            return
        }

        const audioCtx = audio.getAudioContext()
        if (audioCtx && audioCtx.state === 'suspended') {
            console.log('AudioContext đang suspended, đang thử resume...')
            audioCtx.resume().then(() => {
                console.log('AudioContext đã resume thành công bởi tương tác người dùng.')
                toggleMetronomeState()
            }).catch(e => {
                console.error('Lỗi khi resume AudioContext trong handleStartStopInteraction:', e)
            })
        } else if (audioCtx && audioCtx.state === 'running') {
            console.log('AudioContext đã ở trạng thái running.')
            toggleMetronomeState()
        } else {
            console.error(`AudioContext ở trạng thái không mong muốn: ${audioCtx ? audioCtx.state : 'null'} hoặc chưa được khởi tạo đúng cách.`)
        }
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

    if (dom.startStopButtonElement) {
        dom.startStopButtonElement.addEventListener('click', handleStartStopInteraction)

        dom.startStopButtonElement.addEventListener('touchstart', (event) => {
            event.preventDefault()
            event.stopPropagation()
            console.log('Sự kiện touchstart trên nút đã kích hoạt và dừng lan truyền')
            handleStartStopInteraction()
        }, { passive: false })
    }

    // Kỹ thuật "Mở khóa" AudioContext bằng cử chỉ chạm/click đầu tiên trên trang
    function unlockAudioFirstTouch() {
        const tempAudioCtx = audio.getAudioContext()
        if (tempAudioCtx && tempAudioCtx.state === 'suspended') {
            tempAudioCtx.resume().then(() => {
                console.log('AudioContext đã được mở khóa toàn cục bởi cử chỉ đầu tiên.')
            }).catch(e => console.error('Lỗi mở khóa AudioContext toàn cục:', e))
        }
        // Xóa các listener này sau khi đã chạy một lần
        document.body.removeEventListener('touchstart', unlockAudioFirstTouch, true) // Sử dụng capturing phase nếu cần thiết
        document.body.removeEventListener('click', unlockAudioFirstTouch, true)      // để đảm bảo chạy trước các event khác
    }

    // Khởi tạo AudioContext sớm và gắn listener để mở khóa
    // Nên gọi initializeAudioContext trước để getAudioContext có giá trị
    if (audio.initializeAudioContext()) {
        // Chỉ gắn listener nếu AudioContext có thể được khởi tạo
        const tempAudioCtxForUnlock = audio.getAudioContext()
        if (tempAudioCtxForUnlock && tempAudioCtxForUnlock.state === 'suspended') {
            // Chỉ thêm listener nếu context thực sự cần resume
            document.body.addEventListener('touchstart', unlockAudioFirstTouch, { once: true, capture: true })
            document.body.addEventListener('click', unlockAudioFirstTouch, { once: true, capture: true })
            console.log('Đã gắn listener để mở khóa AudioContext bằng cử chỉ đầu tiên.')
        } else if (tempAudioCtxForUnlock) {
            console.log('AudioContext đã ở trạng thái:', tempAudioCtxForUnlock.state, ', không cần listener mở khóa.')
        }
    } else {
        console.warn('Không thể khởi tạo AudioContext, listener mở khóa không được gắn.')
    }
})