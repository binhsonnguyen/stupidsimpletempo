import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
// --- main.js giờ sẽ import tất cả các service cho V2 ---
import { advancedPanelController } from './application/advancedPanelController.js'
import { orientationService } from './infrastructure/services/orientationService.js'
import { panelAnimator } from './infrastructure/ui/panelAnimator.js'
import { initializeGestureDetector } from './infrastructure/ui/gestureService.js'
import {logger} from "./infrastructure/logger";

// --- Các hàm khởi tạo dùng chung ---
function initializeSharedUI ({ view, state }) {
    view.createTickMarks()
    view.displayAppVersion(APP_VERSION)
    view.updateDialVisual(state.currentDialRotation)
}

function setupCoreAppLogic ({
                                view, audioService, dom, initializeController, useCases, metronome, wakeLockService, presenter
                            }) {
    // ... (Nội dung hàm này không thay đổi)
    view.setButtonState('loading')
    const audioReadyPromise = new Promise((resolve, reject) => {
        if (!audioService.initializeAudioContext()) { return reject(new Error('AudioContext không được hỗ trợ.')) }
        const audioCtx = audioService.getAudioContext()
        if (audioCtx.state === 'running') { return resolve(null) }
        const unlockHandler = (event) => {
            event.preventDefault()
            event.stopPropagation()
            audioCtx.resume().then(() => resolve(event.target)).catch(err => reject(err))
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
            useCases.toggleMetronome()
        }
        presenter.renderApp()
    }).catch(err => {
        logger.error('Không thể làm cho audio sẵn sàng:', err)
        if (dom.startStopButtonElement) {
            dom.startStopButtonElement.classList.remove('loading'); dom.startStopButtonElement.classList.add('error'); dom.startStopButtonElement.style.cursor = 'not-allowed'
        }
    })
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('sw.js', import.meta.url)).then(() => { logger.log('Service Worker đã được đăng ký thành công.') }).catch(error => { console.error('Đăng ký Service Worker thất bại:', error) })
        })
    }
    document.addEventListener('visibilitychange', () => {
        if (metronome.isRunning && document.visibilityState === 'visible') {
            wakeLockService.request()
        }
    })
}

// --- Hàm khởi tạo cho từng phiên bản ---
function initializeAppV1 () {
    logger.log('Khởi tạo phiên bản đơn giản (V1)...')
    initializeSharedUI(dependencies)
    setupCoreAppLogic(dependencies)
}

function initializeAppV2 () {
    logger.log('Khởi tạo phiên bản nâng cao (V2)...')
    initializeSharedUI(dependencies)
    setupCoreAppLogic(dependencies)

    const { dom } = dependencies
    if (dom.dialAreaWrapperElement && dom.advancedPanelElement) {
        // "Tổng chỉ huy" khởi tạo và "tiêm" các phụ thuộc vào cho controller
        advancedPanelController.init(
            { // options
                gestureTargetElement: dom.dialAreaWrapperElement,
                panelElement: dom.advancedPanelElement
            },
            { // services
                panelAnimator,
                orientationService,
                initializeGestureDetector
            }
        )
    }
}

// --- Điểm vào ứng dụng & Bộ định tuyến ---
window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
    const path = window.location.pathname
    if (path.startsWith('/v2')) {
        initializeAppV2()
    } else {
        initializeAppV1()
    }
})