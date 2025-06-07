import { APP_VERSION } from './version.js'
import * as state from './application/state.js'
import * as dom from './infrastructure/ui/domElements.js'
import * as audioService from './infrastructure/audio/audioService.js'
import * as view from './infrastructure/ui/view.js'
import * as presenter from './application/presenter.js'
import { initializeController } from './application/controller.js'
import { Metronome } from './domain/metronome.js'
import * as useCases from './domain/useCases.js'
import * as config from './infrastructure/config.js'

const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
})

const wakeLockService = {
    sentinel: null,
    async request() {
        if ('wakeLock' in navigator && this.sentinel === null) {
            try {
                this.sentinel = await navigator.wakeLock.request('screen')
                this.sentinel.addEventListener('release', () => {
                    this.sentinel = null
                })
            } catch (err) {
                console.error(`${err.name}, ${err.message}`)
            }
        }
    },
    async release() {
        if (this.sentinel) {
            await this.sentinel.release()
            this.sentinel = null
        }
    }
}

const dependencies = {
    metronome,
    useCases,
    state,
    config,
    dom,
    view,
    presenter,
    audioService,
    wakeLockService
}

presenter.initializePresenter(dependencies)

window.addEventListener('DOMContentLoaded', () => {
    // --- 1. Thiết lập giao diện ban đầu ---
    view.createTickMarks()
    view.displayAppVersion(APP_VERSION)
    view.updateDialVisual(state.currentDialRotation)

    // --- 2. Khởi tạo các dịch vụ cốt lõi ---
    const isAudioSupported = audioService.initializeAudioContext()

    if (!isAudioSupported) {
        console.error("AudioContext không được hỗ trợ trên trình duyệt này.")
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.classList.add('error')
            dom.startStopButtonElement.style.cursor = 'not-allowed'
        }
        return // Dừng khởi tạo nếu không có audio
    }

    // --- 3. Thiết lập trạng thái và Controller ---
    // Thay vì 'loading', đặt nút về trạng thái ban đầu thực sự của nó ('off')
    view.setButtonState(metronome.isRunning)

    // Khởi tạo controller ngay lập tức.
    // Controller đã đủ thông minh để xử lý việc kích hoạt AudioContext khi người dùng nhấn nút lần đầu.
    initializeController(dependencies)

    // --- 4. Đăng ký PWA & xử lý chạy nền ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('sw.js', import.meta.url))
                .then(registration => {
                    console.log('Service Worker đã được đăng ký thành công.')
                })
                .catch(error => {
                    console.error('Đăng ký Service Worker thất bại:', error)
                })
        })
    }

    document.addEventListener('visibilitychange', () => {
        if (metronome.isRunning && document.visibilityState === 'visible') {
            wakeLockService.request().then(r => {})
        }
    })
})