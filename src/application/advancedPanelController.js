// Xóa hết các import đến service cấp dưới, chỉ giữ lại logger nếu cần
import { logger } from '../infrastructure/logger.js'

// Các biến để giữ tham chiếu đến service sẽ được "tiêm" vào
let panelAnimator = null
let orientationService = null

function handleSwipe (direction) {
    logger.log(`Controller nhận được tín hiệu vuốt: ${direction}`)
    const orientation = orientationService.get()

    if (orientation === 'portrait') {
        switch (direction) {
            case 'down':
                panelAnimator.revealFrom('top')
                break
            case 'up':
                panelAnimator.hide()
                break
        }
    }

    if (orientation === 'landscape') {
        switch (direction) {
            case 'right':
                panelAnimator.revealFrom('left')
                break
            case 'left':
                panelAnimator.hide()
                break
        }
    }
}

// init giờ nhận thêm một tham số là các service
function init (options, services) {
    if (!options.gestureTargetElement || !options.panelElement) {
        return logger.error('Controller.init thất bại: thiếu các phần tử DOM.')
    }
    if (!services.panelAnimator || !services.orientationService || !services.initializeGestureDetector) {
        return logger.error('Controller.init thất bại: thiếu các service cần thiết.')
    }

    // Nhận các service từ bên ngoài thay vì tự import
    panelAnimator = services.panelAnimator
    orientationService = services.orientationService
    const initializeGestureDetector = services.initializeGestureDetector

    // Khởi tạo các service con
    panelAnimator.init({ panelElement: options.panelElement })
    initializeGestureDetector({
        targetElement: options.gestureTargetElement,
        onSwipe: handleSwipe
    })
}

export const advancedPanelController = {
    init
}