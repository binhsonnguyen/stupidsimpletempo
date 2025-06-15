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
let latestBpmDuringAudioContextUnlocking = undefined

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements()
        .then(() => initializeApp())
        .then(() => {
            audioService.initializeAudioContext()
            const audioCtx = audioService.getAudioContext()
            activeAudioUnlockPromise = unlockAudioContext(audioCtx)
            activeAudioUnlockPromise.catch(err => {
                logger.warn('Initial audio unlock promise rejected or timed out (no user interaction?):', err);
            })
            return activeAudioUnlockPromise
        })
        .then(registerServiceWorker)
        .then(requestWakeLock)
        .catch(error => {
            logger.error("Error during app initialization chain:", error);
        });
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
            const audioCtx = audioService.getAudioContext();

            if (audioCtx.state === 'running') {
                controller.handleDialChanged({ useCases, presenter }, newValue);
            } else if (audioCtx.state === 'suspended' && device.isMobile()) {
                logger.log(`Dial changed to ${newValue} BPM while mobile audio suspended. Storing as latest.`);
                latestBpmDuringAudioContextUnlocking = newValue; // Luôn cập nhật giá trị BPM mới nhất

                if (!audioContextInprogress) {
                    audioContextInprogress = true;
                    logger.log('Mobile audio unlock not in progress. Initiating.');

                    activeAudioUnlockPromise = unlockAudioContext(audioCtx)
                        .then(() => {
                            logger.log('Mobile audio unlocked. Processing latest BPM from unlock period.');
                            if (!latestBpmDuringAudioContextUnlocking) {
                                controller.handleDialChanged({ useCases, presenter }, latestBpmDuringMobileUnlock);
                            }
                        })
                        .catch(err => {
                            logger.error('Mobile audio unlock failed:', err);
                        })
                        .finally(() => {
                            logger.log('Resetting mobile audio unlock state.');
                            audioContextInprogress = false;
                            latestBpmDuringAudioContextUnlocking = null;
                            activeAudioUnlockPromise = null;
                        });
                } else {
                    logger.log('Mobile audio unlock already in progress. Latest BPM updated.');
                }
            } else {
                logger.log(`Dial changed to ${newValue} BPM. State: ${audioCtx.state}, Mobile: ${device.isMobile()}. Proceeding directly.`);
                controller.handleDialChanged({ useCases, presenter }, newValue);
            }
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
                    .register(new URL('./infrastructure/services/sw.js', import.meta.url))
                    .then(() => {
                        logger.log('Service worker has been registered.')
                        resolve()
                    })
                    .catch(error => {
                        logger.error('Service worker registration failed:', error);
                        resolve()
                    });
            })
        } else {
            logger.log('Service worker not supported.');
            resolve()
        }
    })
}

function requestWakeLock() {
    return new Promise((resolve, reject) => {
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
