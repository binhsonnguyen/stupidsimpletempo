// /src/infrastructure/ui/components/advancedPanel.js
import { logger } from '../../logger.js'
import { initializeGestureDetector } from '../gestureService.js' // Import trực tiếp
import { orientationService } from '../../services/orientationService.js' // Import trực tiếp

export class AdvancedPanel {
    constructor ({ panelElement, gestureTargetElement }) { // Thêm gestureTargetElement
        if (!panelElement) {
            throw new Error('AdvancedPanel component yêu cầu có panelElement.')
        }
        if (!gestureTargetElement) { // Kiểm tra gestureTargetElement
            throw new Error('AdvancedPanel component yêu cầu có gestureTargetElement.')
        }

        this.panelElement = panelElement
        this.gestureTargetElement = gestureTargetElement // Lưu lại
        this.isVisible = this.panelElement.classList.contains('visible')

        this._handleSwipe = this._handleSwipe.bind(this) // Bind _handleSwipe
        this._setupGestureListener() // Gọi hàm cài đặt listener
    }

    // --- Các phương thức show, hide, toggle, getIsVisible, revealFrom giữ nguyên từ Bước 2 ---
    show () {
        if (this.isVisible || !this.panelElement) return
        this.panelElement.classList.add('visible')
        this.isVisible = true
        logger.log('AdvancedPanel Component: showed')
    }

    hide () {
        if (!this.isVisible || !this.panelElement) return
        this.panelElement.classList.remove('visible')
        this.isVisible = false
        logger.log('AdvancedPanel Component: hidden')
    }

    toggle () {
        if (this.isVisible) {
            this.hide()
        } else {
            this.show()
        }
    }

    getIsVisible () {
        return this.isVisible
    }

    revealFrom (direction) {
        logger.log(`AdvancedPanel Component: Lệnh revealFrom với hướng: '${direction}'`)
        if (!this.panelElement) return
        switch (direction) {
            case 'top':
            case 'left':
            case 'right':
            case 'bottom':
                this.show()
                break
            default:
                logger.warn(`AdvancedPanel Component: Hướng hoạt ảnh không xác định: ${direction}, đang hiển thị mặc định.`)
                this.show()
        }
    }

    // --- Thêm logic xử lý cử chỉ vào component ---
    _setupGestureListener () {
        initializeGestureDetector({
            targetElement: this.gestureTargetElement,
            onSwipe: this._handleSwipe // Callback là _handleSwipe của chính component này
        })
        logger.log('AdvancedPanel Component: Gesture detector đã được khởi tạo.')
    }

    _handleSwipe (direction) {
        logger.log(`AdvancedPanel Component nhận được tín hiệu vuốt: ${direction}`)
        const orientation = orientationService.get() // Sử dụng orientationService đã import

        if (orientation === 'portrait') {
            switch (direction) {
                case 'down':
                    this.revealFrom('top')
                    break
                case 'up':
                    this.hide()
                    break
            }
        }

        if (orientation === 'landscape') {
            switch (direction) {
                case 'right':
                    this.revealFrom('left')
                    break
                case 'left':
                    this.hide()
                    break
            }
        }
    }
}