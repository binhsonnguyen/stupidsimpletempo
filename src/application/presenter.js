import { logger } from '../infrastructure/logger.js'

let view
let metronome
let state

export function initializePresenter(dependencies) {
    view = dependencies.view
    metronome = dependencies.metronome
    state = dependencies.state
}

export function renderApp() {
    if (!view || !metronome || !state) return

    view.setButtonState(metronome.isRunning)
    view.updateDialVisual(state.currentDialRotation)

    logger.log(`BPM: ${metronome.bpm} | Running: ${metronome.isRunning} | Dial Angle: ${state.currentDialRotation.toFixed(1)}`)
}

export function renderInitialUi(appVersion) {
    if (!view) return

    view.createTickMarks()
    view.displayAppVersion(appVersion)
    renderApp()
}