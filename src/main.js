// /src/main.js
import { APP_VERSION } from './version.js'
import { dependencies } from './container.js'
import * as controller from './infrastructure/controllers/controller.js'
import {registerUnlockAudioContextHook} from "./infrastructure/hooks/registerUnlockAudioContextHook";
import {isMobile} from "./infrastructure/services/device";

window.addEventListener('DOMContentLoaded', () => {
    dependencies.initDomElements().then(() => initializeApp())
})

function initializeApp () {
    const {
        dom,
        components,
        presenter,
        useCases,
        audioService,
        metronome,
        wakeLockService
    } = dependencies

    audioService.initializeAudioContext();

    if (!isMobile()) {
        registerUnlockAudioContextHook(audioService.getAudioContext()).then(() => {})
    }

    // Tạo và gán instance của StartButton
    dependencies.startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => {
            if (isMobile()) {
                registerUnlockAudioContextHook(audioService.getAudioContext())
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
                }).then(() => {});
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
        window.addEventListener('load', () => controller.registerServiceWorker())
    }
    document.addEventListener('visibilitychange', () => controller.wakeLockServiceRequest())
}
