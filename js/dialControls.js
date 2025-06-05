// js/dialControls.js

import * as dom from './domElements.js'
import * as state from './state.js'
import * as ui from './ui.js'
import * as config from './config.js'

let isDraggingDial = false
let previousPointerAngle = 0

function getAngleFromEvent(clientX, clientY) {
    const rect = dom.rotaryDialContainerElement.getBoundingClientRect()
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

function updateBpmFromDialAngle() {
    const angleOnDial = state.effectiveKnobAngleOnDialScale
    let newBpmCandidate
    const roundedAngle = Math.round(angleOnDial)

    const angle0Mark = config.ANGLE_FOR_0_BPM_MARK
    const angleMinBpmMark = config.ANGLE_FOR_MIN_SCALE_BPM_MARK
    const angleMaxBpmMark = config.ANGLE_FOR_MAX_SCALE_BPM_MARK

    const bpmAtMinScale = config.MIN_SCALE_BPM
    const bpmAtMaxScale = config.MAX_SCALE_BPM

    if (roundedAngle === angle0Mark || (roundedAngle === 360 && angle0Mark === 0)) {
        return // Không thay đổi BPM tại mốc "0"
    } else if (
        (angleOnDial > angle0Mark && angleOnDial < angleMinBpmMark)
    ) {
        newBpmCandidate = bpmAtMinScale
    } else if (angleOnDial >= angleMinBpmMark && angleOnDial <= angleMaxBpmMark) {
        const bpmScaleRangeValue = bpmAtMaxScale - bpmAtMinScale
        const angleScaleRangeValue = angleMaxBpmMark - angleMinBpmMark

        if (angleScaleRangeValue === 0) {
            newBpmCandidate = bpmAtMinScale
        } else if (bpmScaleRangeValue === 0) {
            newBpmCandidate = bpmAtMinScale
        } else {
            const percentageInAngleRange = (angleOnDial - angleMinBpmMark) / angleScaleRangeValue
            let calculatedBpm = bpmAtMinScale + percentageInAngleRange * bpmScaleRangeValue
            newBpmCandidate = Math.round(calculatedBpm)
        }

        newBpmCandidate = Math.max(bpmAtMinScale, Math.min(bpmAtMaxScale, newBpmCandidate))
    } else {
        newBpmCandidate = bpmAtMaxScale
    }

    console.log('newBpmCandidate:', newBpmCandidate, 'for effectiveKnobAngleOnDialScale:', angleOnDial.toFixed(2))
    state.setCurrentBpm(newBpmCandidate)
}

function handleDialInteractionStart(event) {
    event.preventDefault()
    isDraggingDial = true
    dom.rotaryDialContainerElement.style.cursor = 'grabbing'
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

    const newRawDialRotation = state.currentDialRotation + deltaAngle
    state.setCurrentDialRotation(newRawDialRotation)

    ui.updateDialVisual(state.currentDialRotation)

    updateBpmFromDialAngle()

    previousPointerAngle = currentPointerAngle
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