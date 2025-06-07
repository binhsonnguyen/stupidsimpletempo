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
import { wakeLockService } from './infrastructure/services/wakeLockService.js'
import { initializeSwipePanel } from './infrastructure/ui/gestureService.js'

// --- Các đối tượng và dependencies dùng chung ---
const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
})

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

// --- Hàm khởi tạo cho phiên bản V1 (đơn giản) ---
function initializeAppV1() {
    view.createTickMarks()
    view.displayAppVersion(APP_VERSION)
    view.updateDialVisual(state.currentDialRotation)
    view.setButtonState('loading')

    const audioReadyPromise = new Promise((resolve, reject) => {
        if (!audioService.initializeAudioContext()) {
            return reject(new Error("AudioContext không được hỗ trợ."))
        }
        const audioCtx = audioService.getAudioContext()
        if (audioCtx.state === 'running') {
            return resolve(null)
        }
        const unlockHandler = (event) => {
            event.preventDefault()
            event.stopPropagation()
            audioCtx.resume()
                .then(() => resolve(event.target))
                .catch(err => reject(err))
                .finally(() => {
                    document.body.removeEventListener('touchstart', unlockHandler, true)
                    document.body.removeEventListener('click', unlockHandler, true)
                })
        }
        document.body.addEventListener('touchstart', unlockHandler, { once: true, capture: true })
        document.body.addEventListener('click', unlockHandler, { once: true, capture: true })
    })

    audioReadyPromise.then((firstInteractionTarget) => {
        initializeController(dependencies)
        if (firstInteractionTarget && dom.startStopButtonElement.contains(firstInteractionTarget)) {
            useCases.toggleMetronome(dependencies.metronome, dependencies.audioService, dependencies.wakeLockService)
        }
        presenter.renderApp()
    }).catch(err => {
        console.error("Không thể làm cho audio sẵn sàng:", err)
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.classList.remove('loading')
            dom.startStopButtonElement.classList.add('error')
            dom.startStopButtonElement.style.cursor = 'not-allowed'
        }
    })

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('sw.js', import.meta.url))
                .then(() => { console.log('Service Worker đã được đăng ký thành công.') })
                .catch(error => { console.error('Đăng ký Service Worker thất bại:', error) })
        })
    }

    document.addEventListener('visibilitychange', () => {
        if (metronome.isRunning && document.visibilityState === 'visible') {
            wakeLockService.request()
        }
    })
}

// --- Hàm khởi tạo cho phiên bản V2 (nâng cao) ---
function initializeAppV2() {
    console.log('Khởi tạo phiên bản nâng cao (V2)...')

    // Khởi tạo các thành phần cơ bản từ V1
    initializeAppV1()

    // Khởi tạo panel và cử chỉ vuốt
    if (dom.mainAppElement && dom.advancedPanelElement) {
        initializeSwipePanel({
            targetElement: dom.mainAppElement,
            panelElement: dom.advancedPanelElement
        })
    }
}


// --- Điểm vào ứng dụng & Bộ định tuyến ---
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname

    // Dùng startsWith để linh hoạt hơn (chấp nhận /v2 và /v2/)
    if (path.startsWith('/v2')) {
        initializeAppV2()
    } else {
        initializeAppV1()
    }
})