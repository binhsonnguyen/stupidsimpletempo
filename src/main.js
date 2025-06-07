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

window.addEventListener('DOMContentLoaded', () => {
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
            return resolve(null) // Resolve với target rỗng nếu audio đã chạy
        }

        const unlockHandler = (event) => {
            // Ngăn các hành vi mặc định có thể gây click ảo trên mobile
            event.preventDefault()
            event.stopPropagation()

            audioCtx.resume()
                .then(() => resolve(event.target)) // Truyền "mục tiêu" của sự kiện đi
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

        // Nếu tương tác đầu tiên là vào nút Start/Stop, hãy bật metronome
        if (firstInteractionTarget && dom.startStopButtonElement.contains(firstInteractionTarget)) {
            useCases.toggleMetronome(dependencies.metronome, dependencies.audioService, dependencies.wakeLockService)
        }

        // Dùng presenter để cập nhật toàn bộ UI theo trạng thái cuối cùng
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
                .then(() => {
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