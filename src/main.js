// /src/main.js
import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
import * as controller from './ui/controllers/controller.js'
import * as device from "./infrastructure/services/device";
import {logger} from "./infrastructure/logger";

const {
    dom,
    components,
    presenter,
    useCases,
    audioService,
    metronome,
    wakeLockService
} = dependencies

let audioContextInprogress = false
let activeAudioUnlockPromise = undefined

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
        .then(() => initializeApp())
        .then(() => {
            audioService.initializeAudioContext()
            return unlockDesktopAudioContext(audioService.getAudioContext())
        })
        .then(registerServiceWorker())
        .then(requestWakeLock())
})

function initializeApp () {
    logger.log('initializeApp')

    dependencies.startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => {
            const audioCtx = audioService.getAudioContext();
            if (audioCtx.state === 'suspended' && device.isMobile()) {
                if (!audioContextInprogress) {
                    audioContextInprogress = true;
                    activeAudioUnlockPromise = unlockAudioContext(audioCtx)
                        .then(() => controller.handleButtonTap({ useCases, presenter }))
                        .catch(err => logger.error('Start button audio unlock failed:', err))
                        .finally(() => {
                            audioContextInprogress = false;
                            activeAudioUnlockPromise = null;
                        });
                } else if (!!activeAudioUnlockPromise) {
                    activeAudioUnlockPromise
                        .then(() => controller.handleButtonTap({ useCases, presenter }))
                        .catch(err => logger.error('Start button tap after dial unlock failed:', err));
                }
            } else {
                controller.handleButtonTap({ useCases, presenter });
            }
        }
    });

    dependencies.dial = new components.Dial({
        element: dom.rotaryDialContainerElement,
        layersToRotate: [
            dom.labelLayerElement,
            dom.tickMarkLayerElement,
            dom.dialTrackBorderLayerElement,
            dom.arcLayerElement
        ],
        onDialChangeToNewBpmValue: (newValue) => {
            unlockMobileAudioContext(audioService.getAudioContext())
                .then(() => controller.handleDialChanged({ useCases, presenter }, newValue))

        }
    })

    presenter.initializePresenter(dependencies)
    presenter.renderInitialUi(dependencies, APP_VERSION)
}

function registerServiceWorker() {
    return new Promise((resolve, reject) => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register(new URL('./infrastructure/services/sw.js', import.meta.url))
                    .then(() => {
                        logger.log('Service worker has been registered.')
                    })
            })
        }
        resolve()
    })
}

function requestWakeLock() {
    return new Promise((resolve, reject) => {
        document.addEventListener('visibilitychange', () => {
            if (dependencies.metronome.isRunning && document.visibilityState === 'visible') {
                dependencies.wakeLockService.request().then(() => { })
            }
        })
        resolve()
    })
}

function unlockDesktopAudioContext(audioCtx) {
    return audioCtx.state === 'suspended' ? new Promise(resolve => {
        if (device.isDesktop()) {
            logger.log('unlockDesktopAudioContext')
            unlockAudioContext(audioCtx).then(resolve);
        } else {
            logger.log('by pass unlockDesktopAudioContext')
            resolve()
        }
    }) : new Promise(r => r())
}

function unlockMobileAudioContext(audioCtx) {
    return audioCtx.state === 'suspended' ?  new Promise(resolve => {
        if (device.isMobile()) {
            logger.log('unlockMobileAudioContext')
            unlockAudioContext(audioCtx).then(resolve);
        } else {
            logger.log('by pass unlockMobileAudioContext')
            resolve()
        }
    }) : new Promise(r => r())
}

function unlockAudioContext(ctx) {
    if (!ctx) return Promise.reject(new Error("AudioContext is null"));

    return ctx.state === 'suspended' ? new Promise((resolve) => {
        const b = document.body
        const events = ["touchstart", "touchend", "mousedown", "keydown"]
        let hasUnlocked = false
        const unlock = () => {
            if (hasUnlocked) return;
            if (ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    hasUnlocked = true;
                    clean()
                    resolve()
                }).catch(err => {
                    hasUnlocked = true;
                    clean();
                    reject(err);
                })
            } else {
                hasUnlocked = true;
                clean()
                resolve()
            }
        };
        const clean = () => {
            events.forEach(e => b.removeEventListener(e, unlock))
        };
        events.forEach(e => b.addEventListener(e, unlock, false))
    }) : Promise.resolve()
}
