import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
import * as controller from './application/controller.js'

// Hàm khởi tạo ứng dụng, nơi chúng ta lắp ráp mọi thứ
function initializeApp () {
    const { dom, components, presenter, useCases, audioService, metronome, wakeLockService, state } = dependencies

    // 1. Khởi tạo các UI component
    const startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => controller.handleButtonTap({ useCases, presenter, audioService })
    })

    const dial = new components.Dial({
        element: dom.rotaryDialContainerElement,
        layers: [dom.labelLayerElement, dom.tickMarkLayerElement, dom.dialTrackBorderLayerElement, dom.arcLayerElement],
        onAngleChanged: (newAngle) => controller.handleAngleChanged({ useCases, presenter }, newAngle)
    })

    // 2. Thêm các thực thể component vào dependencies để presenter có thể sử dụng
    dependencies.startButton = startButton
    dependencies.dial = dial

    // 3. Khởi tạo presenter SAU KHI đã có các thực thể component
    presenter.initializePresenter(dependencies)

    // 4. Vẽ giao diện ban đầu
    presenter.renderInitialUi(dependencies, APP_VERSION)

    // 5. Mở khóa audio khi người dùng tương tác lần đầu
    const audioUnlocker = new Promise((resolve) => {
        const unlock = () => {
            audioService.getAudioContext()?.resume().then(resolve)
            document.body.removeEventListener('touchstart', unlock, true)
            document.body.removeEventListener('click', unlock, true)
        }
        document.body.addEventListener('touchstart', unlock, { once: true, capture: true })
        document.body.addEventListener('click', unlock, { once: true, capture: true })
    })

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('sw.js', import.meta.url))
        })
    }
    document.addEventListener('visibilitychange', () => {
        if (metronome.isRunning && document.visibilityState === 'visible') {
            wakeLockService.request()
        }
    })
}

// --- Điểm vào ứng dụng ---
window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
    initializeApp()
})