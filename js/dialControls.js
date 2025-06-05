import * as dom from './domElements.js'
import * as state from './state.js'
import * as ui from './ui.js'
import * as config from './config.js'

let isDraggingDial = false
let previousPointerAngle = 0 // Đã đổi tên từ previousAngle để rõ nghĩa hơn

function getAngleFromEvent(clientX, clientY) {
    const rect = dom.rotaryDialContainerElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dyInverted = centerY - clientY // Trục Y dương hướng lên từ tâm

    let angleDeg = Math.atan2(dx, dyInverted) * 180 / Math.PI

    if (angleDeg < 0) {
        angleDeg += 360 // Chuẩn hóa về 0-359 độ
    }
    return angleDeg
}

function updateBpmFromDialAngle() {
    const angleOnDial = state.effectiveKnobAngleOnDialScale // Sử dụng giá trị từ state

    let newBpmCandidate
    const roundedAngle = Math.round(angleOnDial)

    const angle0Mark = config.ANGLE_FOR_0_BPM_MARK
    const angle40Mark = config.ANGLE_FOR_40_BPM_MARK
    const angle200Mark = config.ANGLE_FOR_200_BPM_MARK

    const bpmAt40 = config.BPM_VALUE_AT_40_DEG_MARK
    const bpmAt200 = config.BPM_VALUE_AT_200_DEG_MARK

    if (roundedAngle === angle0Mark || (roundedAngle === 360 && angle0Mark === 0)) {
        return
    } else if (angleOnDial > angle0Mark && angleOnDial < angle40Mark) {
        newBpmCandidate = bpmAt40
    } else if (angleOnDial > angle200Mark && angleOnDial < 360) {
        newBpmCandidate = bpmAt200
    } else {
        const bpmScaleStartValue = bpmAt40
        const bpmScaleEndValue = bpmAt200
        const angleScaleStartValue = angle40Mark
        const angleScaleEndValue = angle200Mark

        if (angleScaleEndValue === angleScaleStartValue) {
            newBpmCandidate = bpmScaleStartValue
        } else {
            const percentageInAngleRange = (angleOnDial - angleScaleStartValue) / (angleScaleEndValue - angleScaleStartValue)
            let calculatedBpm = bpmScaleStartValue + percentageInAngleRange * (bpmScaleEndValue - bpmScaleStartValue)
            newBpmCandidate = Math.round(calculatedBpm)
        }

        newBpmCandidate = Math.max(bpmScaleStartValue, Math.min(bpmScaleEndValue, newBpmCandidate))
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