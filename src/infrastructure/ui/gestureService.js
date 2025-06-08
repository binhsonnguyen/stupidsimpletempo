import { GESTURE_DRAG_THRESHOLD_PX } from '../config.js'

let onSwipeCallback = null
let gestureTargetElement = null

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragCurrentX = 0
let dragCurrentY = 0

function getCoords (event) {
    const source = event.touches ? event.touches[0] : event
    return { x: source.clientX, y: source.clientY }
}

function onDragStart (event) {
    if (event.type === 'mousedown' && event.button !== 0) return
    event.preventDefault()

    isDragging = true
    const { x, y } = getCoords(event)
    dragStartX = x
    dragStartY = y
    dragCurrentX = dragStartX
    dragCurrentY = dragStartY

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('touchmove', onDragMove, { passive: true })
    document.addEventListener('mouseup', onDragEnd)
    document.addEventListener('touchend', onDragEnd)
}

function onDragMove (event) {
    if (!isDragging) return
    const { x, y } = getCoords(event)
    dragCurrentX = x
    dragCurrentY = y
}

function onDragEnd () {
    if (!isDragging || !onSwipeCallback) return
    isDragging = false

    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('touchmove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchend', onDragEnd)

    const dragDeltaX = dragCurrentX - dragStartX
    const dragDeltaY = dragCurrentY - dragStartY

    const absDeltaX = Math.abs(dragDeltaX)
    const absDeltaY = Math.abs(dragDeltaY)

    if (absDeltaX < GESTURE_DRAG_THRESHOLD_PX && absDeltaY < GESTURE_DRAG_THRESHOLD_PX) {
        return
    }

    if (absDeltaX > absDeltaY) {
        // Vuốt ngang là chủ yếu
        onSwipeCallback(dragDeltaX > 0 ? 'right' : 'left')
    } else {
        // Vuốt dọc là chủ yếu
        onSwipeCallback(dragDeltaY > 0 ? 'down' : 'up')
    }
}

export function initializeGestureDetector (options) {
    if (!options.targetElement || typeof options.onSwipe !== 'function') {
        console.error('initializeGestureDetector yêu cầu có targetElement và hàm onSwipe.')
        return
    }

    gestureTargetElement = options.targetElement
    onSwipeCallback = options.onSwipe

    gestureTargetElement.addEventListener('mousedown', onDragStart)
    gestureTargetElement.addEventListener('touchstart', onDragStart, { passive: false })
}