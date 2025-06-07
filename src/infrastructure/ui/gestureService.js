let targetElement = null
let panelElement = null

let isDragging = false
let dragStartY = 0
let dragCurrentY = 0
const DRAG_THRESHOLD = 50 // Ngưỡng vuốt (px), phải vuốt dài hơn giá trị này

function onTouchStart (event) {
    // Chỉ theo dõi khi có 1 ngón tay chạm
    if (event.touches.length !== 1) {
        isDragging = false
        return
    }
    isDragging = true
    dragStartY = event.touches[0].clientY
    dragCurrentY = dragStartY
}

function onTouchMove (event) {
    if (!isDragging || event.touches.length !== 1) return
    dragCurrentY = event.touches[0].clientY
}

function onTouchEnd (event) {
    if (!isDragging) return

    const dragDeltaY = dragCurrentY - dragStartY

    // Vuốt xuống -> Hiện panel
    if (dragDeltaY > DRAG_THRESHOLD) {
        panelElement.classList.add('visible')
    }

    // Vuốt lên -> Ẩn panel
    if (dragDeltaY < -DRAG_THRESHOLD) {
        panelElement.classList.remove('visible')
    }

    // Reset lại trạng thái
    isDragging = false
    dragStartY = 0
    dragCurrentY = 0
}

export function initializeSwipePanel (options) {
    if (!options.targetElement || !options.panelElement) {
        console.error('initializeSwipePanel yêu cầu có targetElement và panelElement.')
        return
    }

    targetElement = options.targetElement
    panelElement = options.panelElement

    targetElement.addEventListener('touchstart', onTouchStart, { passive: true })
    targetElement.addEventListener('touchmove', onTouchMove, { passive: true })
    targetElement.addEventListener('touchend', onTouchEnd)
}