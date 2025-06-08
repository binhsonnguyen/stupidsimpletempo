import { logger } from '../logger.js'

let panelElement = null
let isVisible = false

function revealFromTop () {
    console.log('[panelAnimator] Lệnh show. isVisible:', isVisible, 'panelElement:', panelElement) // <-- LOG 1
    if (isVisible || !panelElement) return
    // Kích hoạt transition 'height' trong CSS
    panelElement.classList.add('visible')
    isVisible = true
}

function hide () {
    if (!isVisible || !panelElement) return
    panelElement.classList.remove('visible')
    isVisible = false
}

function revealFrom (direction) {
    logger.log(`PanelAnimator nhận lệnh revealFrom với hướng: '${direction}'`)

    // Sử dụng switch để dễ dàng mở rộng các hướng khác trong tương lai
    switch (direction) {
        case 'top':
            revealFromTop()
            break
        case 'bottom':
        case 'left':
        case 'right':
            logger.log(`Hoạt ảnh từ hướng '${direction}' chưa được triển khai.`)
            break
        default:
            logger.error(`Không rõ hướng hoạt ảnh: ${direction}`)
    }
}

function init (options) {
    if (!options.panelElement) {
        logger.error('PanelAnimator.init thất bại: thiếu panelElement.')
        return
    }
    panelElement = options.panelElement
    logger.log('[panelAnimator] Đã khởi tạo với panelElement:', panelElement) // <-- LOG 2
}

export const panelAnimator = {
    init,
    revealFrom,
    hide
}