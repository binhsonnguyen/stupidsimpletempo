import { logger } from '../infrastructure/logger.ts'
import { dom } from '../ui/domElements.js'

let metronome = null
let startButton = null

export function initializePresenter (dependencies) {
    metronome = dependencies.metronome
    startButton = dependencies.startButton
}

export function renderApp () {
    if (!metronome) return

    if (startButton) {
        const buttonState = metronome.isRunning ? 'on' : 'off'
        startButton.setState(buttonState)
    }

    logger.log(`BPM: ${metronome.bpm} | Running: ${metronome.isRunning}`)
}

export function renderInitialUi (dependencies, appVersion) {
    if (dom.appVersionElement) {
        if (typeof appVersion !== 'undefined' && appVersion) {
            dom.appVersionElement.textContent = appVersion
        } else {
            dom.appVersionElement.textContent = 'N/A'
        }
    }
    renderApp()
}