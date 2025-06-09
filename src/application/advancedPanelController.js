import { logger } from '../infrastructure/logger.js'

let orientationServiceInstance = null
let gestureServiceInitializeFn = null
let advancedPanelComponent = null

function handleSwipe (direction) {
    logger.log(`AdvancedPanelController nhận được tín hiệu vuốt: ${direction}`)
    const orientation = orientationServiceInstance.get()

    if (!advancedPanelComponent) {
        logger.error('AdvancedPanelController: advancedPanelComponent chưa được khởi tạo.')
        return
    }

    if (orientation === 'portrait') {
        switch (direction) {
            case 'down':
                advancedPanelComponent.revealFrom('top') // Gọi trên component
                break
            case 'up':
                advancedPanelComponent.hide() // Gọi trên component
                break
        }
    }

    if (orientation === 'landscape') {
        switch (direction) {
            case 'right':
                advancedPanelComponent.revealFrom('left') // Gọi trên component
                break
            case 'left':
                advancedPanelComponent.hide() // Gọi trên component
                break
        }
    }
}

function init (options, services, components) {
    if (!options.gestureTargetElement || !options.panelElement) {
        return logger.error('AdvancedPanelController.init thất bại: thiếu các phần tử DOM.')
    }
    if (!services.orientationService || !services.initializeGestureDetector) {
        return logger.error('AdvancedPanelController.init thất bại: thiếu các service (orientation, gesture) cần thiết.')
    }
    if (!components || !components.AdvancedPanel) {
        return logger.error('AdvancedPanelController.init thất bại: thiếu AdvancedPanel component.')
    }

    orientationServiceInstance = services.orientationService
    gestureServiceInitializeFn = services.initializeGestureDetector

    advancedPanelComponent = new components.AdvancedPanel({ panelElement: options.panelElement })

    gestureServiceInitializeFn({
        targetElement: options.gestureTargetElement,
        onSwipe: handleSwipe
    })
    logger.log('AdvancedPanelController đã khởi tạo và sử dụng AdvancedPanel Component.')
}

export const advancedPanelController = {
    init
}
