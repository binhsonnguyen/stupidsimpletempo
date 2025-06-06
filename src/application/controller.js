let isDraggingDial = false
let previousPointerAngle = 0

let dependencies = {}

function getAngleFromEvent(clientX, clientY) {
    const rect = dependencies.dom.rotaryDialContainerElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dyInverted = centerY - clientY

    let angleDeg = Math.atan2(dx, dyInverted) * 180 / Math.PI
    if (angleDeg < 0) {
        angleDeg += 360
    }
    return angleDeg
}

function handleDialInteractionStart(event) {
    if (!dependencies.dom.startStopButtonElement.contains(event.target)) {
        event.preventDefault()
    }
    isDraggingDial = true
    dependencies.dom.rotaryDialContainerElement.style.cursor = 'grabbing'
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    previousPointerAngle = getAngleFromEvent(clientX, clientY)
}

function handleDialInteractionMove(event) {
    if (!isDraggingDial) return
    event.preventDefault()

    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    const currentPointerAngle = getAngleFromEvent(clientX, clientY)

    let deltaAngle = currentPointerAngle - previousPointerAngle

    if (Math.abs(deltaAngle) > 180) {
        deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
    }

    const newRawDialRotation = dependencies.state.currentDialRotation + deltaAngle
    dependencies.state.setCurrentDialRotation(newRawDialRotation)

    dependencies.useCases.changeBpmFromAngle(
        dependencies.metronome,
        dependencies.state.effectiveKnobAngleOnDialScale,
        dependencies.config
    )

    dependencies.presenter.renderApp()

    previousPointerAngle = currentPointerAngle
}

function handleDialInteractionEnd() {
    if (!isDraggingDial) return
    isDraggingDial = false
    dependencies.dom.rotaryDialContainerElement.style.cursor = 'grab'
}

function handleStartStopInteraction(event) {
    if(event) {
        event.preventDefault()
        event.stopPropagation()
    }

    const audioCtx = dependencies.audioService.getAudioContext()

    const performToggle = () => {
        dependencies.useCases.toggleMetronome(
            dependencies.metronome,
            dependencies.audioService,
            dependencies.wakeLockService
        )
        dependencies.presenter.renderApp()
    }

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(performToggle)
    } else if (audioCtx && audioCtx.state === 'running') {
        performToggle()
    } else if (!audioCtx) {
        if(dependencies.audioService.initializeAudioContext()) {
            handleStartStopInteraction()
        }
    }
}

export function initializeController(deps) {
    dependencies = deps

    const dialElement = dependencies.dom.rotaryDialContainerElement
    const buttonElement = dependencies.dom.startStopButtonElement

    dialElement.addEventListener('mousedown', handleDialInteractionStart)
    document.addEventListener('mousemove', handleDialInteractionMove)
    document.addEventListener('mouseup', handleDialInteractionEnd)

    dialElement.addEventListener('touchstart', handleDialInteractionStart, { passive: false })
    document.addEventListener('touchmove', handleDialInteractionMove, { passive: false })
    document.addEventListener('touchend', handleDialInteractionEnd)
    document.addEventListener('touchcancel', handleDialInteractionEnd)

    buttonElement.addEventListener('click', handleStartStopInteraction)
    buttonElement.addEventListener('touchstart', handleStartStopInteraction, { passive: false })
}