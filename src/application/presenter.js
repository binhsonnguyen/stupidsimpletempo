let view
let metronome
let state

export function initializePresenter(dependencies) {
    view = dependencies.view
    metronome = dependencies.metronome
    state = dependencies.state
}

export function renderApp() {
    if (!view) return

    view.setButtonState(metronome.isRunning)
    view.updateDialVisual(state.currentDialRotation)
}

export function renderInitialUi(appVersion) {
    if (!view) return

    view.createTickMarks()
    view.displayAppVersion(appVersion)
    renderApp()
}