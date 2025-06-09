// /src/infrastructure/ui/components/AdvancedPanel.js
import {logger} from '../../logger.js'

export class AdvancedPanel {
    constructor({panelElement}) {
        if (!panelElement) {
            throw new Error('AdvancedPanel component yêu cầu có panelElement.')
        }
        this.panelElement = panelElement
        this.isVisible = this.panelElement.classList.contains('visible')
    }

    show() {
        if (this.isVisible || !this.panelElement) return
        this.panelElement.classList.add('visible')
        this.isVisible = true
        logger.log('AdvancedPanel Component: showed')
    }

    hide() {
        if (!this.isVisible || !this.panelElement) return
        this.panelElement.classList.remove('visible')
        this.isVisible = false
        logger.log('AdvancedPanel Component: hidden')
    }

    toggle() {
        if (this.isVisible) {
            this.hide()
        } else {
            this.show()
        }
    }

    getIsVisible() {
        return this.isVisible
    }

    revealFrom (direction) {
        logger.log(`AdvancedPanel Component: Lệnh revealFrom với hướng: '${direction}'`)
        if (!this.panelElement) return

        // Hiện tại, animation được xử lý bởi CSS qua class 'visible'
        // Các hướng 'left', 'right', 'bottom' có thể cần CSS riêng nếu muốn hiệu ứng khác 'top'
        switch (direction) {
            case 'top':
            case 'left': // Giả sử 'left' cũng dùng hiệu ứng trượt từ trên xuống hoặc hiệu ứng mặc định
            case 'right':
            case 'bottom':
                this.show() // Gọi phương thức show của chính component này
                break
            default:
                logger.warn(`AdvancedPanel Component: Hướng hoạt ảnh không xác định: ${direction}, đang hiển thị mặc định.`)
                this.show()
        }
    }
}