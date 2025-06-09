import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
import * as controller from './application/controller.js'

function initializeApp () {
    const { dom, components, presenter, useCases, audioService, metronome, wakeLockService } = dependencies

    const startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => controller.handleButtonTap({ useCases, presenter, audioService })
    })

    const dial = new components.Dial({
        element: dom.rotaryDialContainerElement,
        layersToRotate: [
            dom.labelLayerElement,
            dom.tickMarkLayerElement,
            dom.dialTrackBorderLayerElement,
            dom.arcLayerElement
        ],
        tickMarkLayerElement: dom.tickMarkLayerElement,
        labelLayerElement: dom.labelLayerElement,
        onAngleChanged: (newAngle) => controller.handleAngleChanged({ useCases, presenter }, newAngle)
    })

    dependencies.startButton = startButton
    dependencies.dial = dial

    presenter.initializePresenter(dependencies)
    presenter.renderInitialUi(dependencies, APP_VERSION)

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

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
    initializeApp()
})