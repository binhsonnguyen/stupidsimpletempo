// /src/application/advancedPanelController.js
import { logger } from '../infrastructure/logger.js'

let panelAnimatorService = null // Đổi tên để rõ ràng đây là service animator
let orientationServiceInstance = null
let gestureServiceInitializeFn = null
// let advancedPanelComponent = null // Chúng ta sẽ tạo instance trong init

function handleSwipe (direction) {
    logger.log(`AdvancedPanelController nhận được tín hiệu vuốt: ${direction}`)
    const orientation = orientationServiceInstance.get()

    if (orientation === 'portrait') {
        switch (direction) {
            case 'down':
                // Vẫn dùng panelAnimatorService ở bước này
                panelAnimatorService.revealFrom('top')
                break
            case 'up':
                panelAnimatorService.hide()
                break
        }
    }

    if (orientation === 'landscape') {
        switch (direction) {
            case 'right':
                panelAnimatorService.revealFrom('left')
                break
            case 'left':
                panelAnimatorService.hide()
                break
        }
    }
}

function init (options, services, components) { // Thêm components vào tham số
    if (!options.gestureTargetElement || !options.panelElement) {
        return logger.error('AdvancedPanelController.init thất bại: thiếu các phần tử DOM.')
    }
    // panelService không còn được truyền vào đây nữa
    if (!services.panelAnimator || !services.orientationService || !services.initializeGestureDetector) {
        return logger.error('AdvancedPanelController.init thất bại: thiếu các service cần thiết.')
    }
    if (!components || !components.AdvancedPanel) { // Kiểm tra component
        return logger.error('AdvancedPanelController.init thất bại: thiếu AdvancedPanel component.')
    }

    panelAnimatorService = services.panelAnimator
    orientationServiceInstance = services.orientationService
    gestureServiceInitializeFn = services.initializeGestureDetector

    // Khởi tạo AdvancedPanel component nhưng chưa dùng nhiều
    // eslint-disable-next-line no-new
    new components.AdvancedPanel({ panelElement: options.panelElement })
    // advancedPanelComponent = new components.AdvancedPanel({ panelElement: options.panelElement })

    // panelAnimator vẫn init như cũ, nó sẽ tự init panelService bên trong nó
    panelAnimatorService.init({ panelElement: options.panelElement })

    gestureServiceInitializeFn({
        targetElement: options.gestureTargetElement,
        onSwipe: handleSwipe
    })
    logger.log('AdvancedPanelController đã khởi tạo.')
}

export const advancedPanelController = {
    init
}
    