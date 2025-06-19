// /src/main.js
import {APP_VERSION} from './version.js'
import {dependencies} from './container.js'
import * as controller from './ui/controllers/controller.ts'
import {logger} from "./infrastructure/logger"
import * as Tone from 'tone'

const {
    dom,
    components,
    presenter,
    useCases,
    audioService,
} = dependencies

let audioContextInprogress = false
let activeAudioUnlockPromise = undefined

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
        .then(() => initializeApp())
        .then(() => {
            audioService.init()
            activeAudioUnlockPromise = unlockAudioContext()
            activeAudioUnlockPromise.catch(err => {
                logger.warn('Initial audio unlock promise rejected or timed out (no user interaction?):', err)
            })
            return activeAudioUnlockPromise
        })
        .then(registerServiceWorker)
        .then(requestWakeLock)
        .catch(error => {
            logger.error("Error during app initialization chain:", error)
        })
})

function initializeApp() {
    logger.log('initializeApp')

    dependencies.startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => {
            const audioCtx = Tone.getContext()
            if (audioCtx.state === 'running') {
                controller.handleButtonTap({useCases, presenter})
            } else if (audioCtx.state === 'suspended') {
                logger.log('StartButton tapped while audio suspended. Awaiting initial unlock.')
                if (!audioContextInprogress) {
                    audioContextInprogress = true
                    activeAudioUnlockPromise
                        .then(() => {
                            logger.log('Mobile audio unlocked (awaited by StartButton). Handling tap.')
                            controller.handleButtonTap({useCases, presenter})
                        })
                        .catch(err => logger.error('Start button: Error awaiting initial audio unlock:', err))
                        .finally(() => {
                            audioContextInprogress = false
                        })
                } else {
                    activeAudioUnlockPromise
                        .then(() => {
                            logger.log('Mobile audio unlock already in progress (awaited by other). Handling StartButton tap post-unlock.')
                            controller.handleButtonTap({useCases, presenter})
                        })
                        .catch(err => logger.error('Start button: Error chaining to active audio unlock:', err))
                }
            } else {
                controller.handleButtonTap({useCases, presenter})
            }
        }
    })

    dependencies.dial = new components.Dial({
        element: dom.rotaryDialContainerElement,
        layersToRotate: [
            dom.labelLayerElement,
            dom.tickMarkLayerElement,
            dom.dialTrackBorderLayerElement,
            dom.arcLayerElement
        ],
        onDialChangeToNewBpmValue: (newValue) => {
            controller.handleDialChanged({useCases, presenter}, newValue)
        }
    })

    presenter.initializePresenter(dependencies)
    presenter.renderInitialUi(dependencies, APP_VERSION)
}

function registerServiceWorker() {
    return new Promise(resolve => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register(new URL('./infrastructure/services/sw.ts', import.meta.url))
                    .then(() => {
                        logger.log('Service worker has been registered.')
                        resolve()
                    })
                    .catch(error => {
                        logger.error('Service worker registration failed:', error)
                        resolve()
                    })
            })
        } else {
            logger.log('Service worker not supported.')
            resolve()
        }
    })
}

function requestWakeLock() {
    return new Promise(resolve => {
        document.addEventListener('visibilitychange', () => {
            if (dependencies.metronome.isRunning && document.visibilityState === 'visible') {
                if (!!dependencies.wakeLockService) {
                    dependencies.wakeLockService.request()
                        .catch(err => logger.warn("Wake lock request failed:", err))
                }
            }
        })
        resolve()
    })
}

function unlockAudioContext() {
    const ctx = Tone.getContext()
    if (!ctx) return Promise.reject(new Error("AudioContext is null"))

    return ctx.state === 'suspended' ? new Promise((resolve, reject) => {
        const b = document.body
        const events = ["touchstart", "touchend", "mousedown", "keydown"]
        let hasUnlocked = false
        const unlock = () => {
            if (hasUnlocked) return
            if (ctx.state === 'suspended') {
                Tone.start()
                    .then(() => {
                        hasUnlocked = true
                        logger.log('AudioContext resumed successfully by user interaction.');
                        clean()
                        resolve()
                    })
                    .catch(err => {
                        hasUnlocked = true
                        logger.error('AudioContext resume failed:', err);
                        clean()
                        reject(err)
                    })
            } else {
                hasUnlocked = true
                logger.log(`AudioContext already in state: ${ctx.state}. No resume needed or possible.`);
                clean()
                resolve()
            }
        }
        const clean = () => {
            events.forEach(e => b.removeEventListener(e, unlock, false))
        }
        events.forEach(e => b.addEventListener(e, unlock, false))
        logger.log('unlockAudioContext: Event listeners added to body to await user interaction.');
    }) : Promise.resolve()
}
