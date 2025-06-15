// /src/main.js
import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
import * as controller from './application/controller.js'
import {wakeLockServiceRequest} from "./infrastructure/controllers/visibilityChange";
import {registerServiceWorker} from "./infrastructure/controllers/registerSW";

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements().then(() => initializeApp())
})

function initializeApp () {
    const {
        dom, components, presenter, useCases, audioService, metronome, wakeLockService
    } = dependencies

    audioService.initializeAudioContext();
    function isMobile() {
        const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return regex.test(navigator.userAgent);
    }

    const unlockAudioContext = (ctx) => {
        return new Promise((resolve) => {
            const b = document.body;
            const events = ["touchstart", "touchend", "mousedown", "keydown"];
            const unlock = () => {
                if (ctx.state === 'suspended') {
                    ctx.resume().then(clean).then(resolve);
                } else {
                    clean()
                    resolve()
                }
            };
            const clean = () => { events.forEach(e => b.removeEventListener(e, unlock));};
            events.forEach(e => b.addEventListener(e, unlock, false));
        })
    }

    if (!isMobile()) {
        unlockAudioContext(audioService.getAudioContext()).then(() => {})
    }

    // Tạo và gán instance của StartButton
    dependencies.startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => {
            if (isMobile()) {
                unlockAudioContext(audioService.getAudioContext())
                    .then(() => controller.handleButtonTap({
                        useCases,
                        presenter,
                        audioService
                    }));
            } else {
                controller.handleButtonTap({
                    useCases,
                    presenter,
                    audioService
                });
            }
        }
    });

    // Tạo và gán instance của Dial
    dependencies.dial = new components.Dial({
        element: dom.rotaryDialContainerElement,
        layersToRotate: [
            dom.labelLayerElement,
            dom.tickMarkLayerElement,
            dom.dialTrackBorderLayerElement,
            dom.arcLayerElement
        ],
        onAngleChanged: (newAngle) => controller.handleAngleChanged({ useCases, presenter }, newAngle)
    })

    presenter.initializePresenter(dependencies)
    presenter.renderInitialUi(dependencies, APP_VERSION)


    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('./infrastructure/services/sw.js', import.meta.url))
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