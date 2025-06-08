import { GESTURE_DRAG_THRESHOLD_PX } from '../config.js'

let targetElement = null
let panelService = null

let isDragging = false
let dragStartY = 0
let dragCurrentY = 0

function getClientY (event) {
    return event.touches ? event.touches[0].clientY : event.clientY
}

function onDragStart (event) {
    if (event.type === 'mousedown' && event.button !== 0) return
    event.preventDefault()

    isDragging = true
    dragStartY = getClientY(event)
    dragCurrentY = dragStartY

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('touchmove', onDragMove, { passive: true })
    document.addEventListener('mouseup', onDragEnd)
    document.addEventListener('touchend', onDragEnd)
}

function onDragMove (event) {
    if (!isDragging) return
    dragCurrentY = getClientY(event)
}

function onDragEnd () {
    if (!isDragging) return
    isDragging = false

    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('touchmove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchend', onDragEnd)

    const dragDeltaY = dragCurrentY - dragStartY

    // Kéo xuống để ra lệnh "hiện" panel
    if (dragDeltaY > GESTURE_DRAG_THRESHOLD_PX) {
        panelService.show()
    }

    // Kéo lên để ra lệnh "ẩn" panel
    if (dragDeltaY < -GESTURE_DRAG_THRESHOLD_PX) {
        panelService.hide()
    }
}

export function initializePullToReveal (options) {
    if (!options.targetElement || !options.panelService) {
        console.error('initializePullToReveal yêu cầu có targetElement và panelService.')
        return
    }

    targetElement = options.targetElement
    panelService = options.panelService

    targetElement.addEventListener('mousedown', onDragStart)
    targetElement.addEventListener('touchstart', onDragStart, { passive: false })
}