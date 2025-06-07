import { GESTURE_DRAG_THRESHOLD_PX } from '../config.js'

let targetElement = null
let panelElement = null

let isDragging = false
let dragStartY = 0
let dragCurrentY = 0

function getClientY (event) {
    // Hàm tiện ích để lấy tọa độ Y từ cả sự kiện touch và mouse
    return event.touches ? event.touches[0].clientY : event.clientY
}

function onDragStart (event) {
    // Chỉ xử lý khi nhấn chuột trái
    if (event.type === 'mousedown' && event.button !== 0) return

    // Ngăn các hành vi mặc định của trình duyệt như chọn văn bản khi kéo chuột
    event.preventDefault()

    isDragging = true
    dragStartY = getClientY(event)
    dragCurrentY = dragStartY

    // Thêm các listener vào document để có thể theo dõi cử chỉ ngay cả khi con trỏ ra ngoài
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

    // Gỡ các listener khỏi document để dọn dẹp, tránh rò rỉ bộ nhớ
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('touchmove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchend', onDragEnd)

    const dragDeltaY = dragCurrentY - dragStartY

    // Vuốt/kéo xuống
    if (dragDeltaY > GESTURE_DRAG_THRESHOLD_PX) {
        panelElement.classList.add('visible')
    }

    // Vuốt/kéo lên
    if (dragDeltaY < -GESTURE_DRAG_THRESHOLD_PX) {
        panelElement.classList.remove('visible')
    }
}

export function initializeSwipePanel (options) {
    if (!options.targetElement || !options.panelElement) {
        console.error('initializeSwipePanel yêu cầu có targetElement và panelElement.')
        return
    }

    targetElement = options.targetElement
    panelElement = options.panelElement

    // Thêm listener cho cả sự kiện mousedown và touchstart trên phần tử mục tiêu
    targetElement.addEventListener('mousedown', onDragStart)
    targetElement.addEventListener('touchstart', onDragStart, { passive: false })
}