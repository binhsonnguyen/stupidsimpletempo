import * as dom from './domElements.js'
import * as state from './state.js'
import * as ui from './ui.js'
import * as config from './config.js'

let isDraggingDial = false
let previousAngle = 0

function getAngleFromEvent(clientX, clientY) {
    const rect = dom.rotaryDialContainerElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angleRad = Math.atan2(clientX - centerX, centerY - clientY)
    let angleDeg = angleRad * 180 / Math.PI
    if (angleDeg < 0) {
        angleDeg += 360
    }
    return angleDeg
}

function handleDialInteractionStart(event) {
    event.preventDefault()
    isDraggingDial = true
    dom.rotaryDialContainerElement.style.cursor = 'grabbing'
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    previousAngle = getAngleFromEvent(clientX, clientY)
}

function handleDialInteractionMove(event) {
    if (!isDraggingDial) return
    event.preventDefault()

    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    const currentAngle = getAngleFromEvent(clientX, clientY)

    let deltaAngle = currentAngle - previousAngle

    if (Math.abs(deltaAngle) > 180) {
        deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
    }

    const bpmChange = Math.round(deltaAngle / config.SENSITIVITY_FACTOR)

    if (bpmChange !== 0) {
        const newBpm = state.currentBpm + bpmChange
        state.setCurrentBpm(newBpm) // Hàm này đã bao gồm giới hạn min/max
    }

    const newDialRotation = state.currentDialRotation + deltaAngle
    state.setCurrentDialRotation(newDialRotation)
    ui.updateDialVisual(state.currentDialRotation)

    previousAngle = currentAngle
}

function handleDialInteractionEnd() {
    if (!isDraggingDial) return
    isDraggingDial = false
    dom.rotaryDialContainerElement.style.cursor = 'grab'
}

export function initializeDialControls() {
    dom.rotaryDialContainerElement.addEventListener('mousedown', handleDialInteractionStart)
    document.addEventListener('mousemove', handleDialInteractionMove)
    document.addEventListener('mouseup', handleDialInteractionEnd)

    dom.rotaryDialContainerElement.addEventListener('touchstart', handleDialInteractionStart, { passive: false })
    document.addEventListener('touchmove', handleDialInteractionMove, { passive: false })
    document.addEventListener('touchend', handleDialInteractionEnd)
    document.addEventListener('touchcancel', handleDialInteractionEnd)
}