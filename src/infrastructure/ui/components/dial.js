export class Dial {
    /**
     * @param {object} options
     * @param {HTMLElement} options.element - Phần tử DOM chính của dial.
     * @param {HTMLElement[]} [options.layers=[]] - Mảng các layer cần được xoay.
     * @param {function} [options.onAngleChanged] - Callback được gọi khi góc xoay thay đổi.
     */
    constructor ({ element, layers = [], onAngleChanged = () => {} }) {
        if (!element) {
            throw new Error('Dial component yêu cầu có một element.')
        }
        this.element = element
        this.layers = layers
        this.onAngleChanged = onAngleChanged

        // Trạng thái nội bộ của component
        this._isDragging = false
        this._previousPointerAngle = 0
        this._currentRotation = 0

        // Bind 'this' cho các event handler
        this._handleInteractionStart = this._handleInteractionStart.bind(this)
        this._handleInteractionMove = this._handleInteractionMove.bind(this)
        this._handleInteractionEnd = this._handleInteractionEnd.bind(this)

        this._setupListeners()
    }

    /**
     * Phương thức công khai để đặt góc xoay từ bên ngoài.
     * @param {number} angle - Góc xoay (độ).
     */
    setRotation (angle) {
        this._currentRotation = angle
        const transformValue = `rotate(${angle}deg)`
        this.layers.forEach(layer => {
            layer.style.transform = transformValue
        })
    }

    // --- Các phương thức "private" xử lý cử chỉ ---

    _setupListeners () {
        this.element.addEventListener('mousedown', this._handleInteractionStart)
        this.element.addEventListener('touchstart', this._handleInteractionStart, { passive: false })

        // Gắn các listener cho document để đảm bảo kéo/thả mượt mà
        document.addEventListener('mousemove', this._handleInteractionMove)
        document.addEventListener('touchmove', this._handleInteractionMove, { passive: false })
        document.addEventListener('mouseup', this._handleInteractionEnd)
        document.addEventListener('touchend', this._handleInteractionEnd)
        document.addEventListener('touchcancel', this._handleInteractionEnd)
    }

    _getAngleFromEvent (clientX, clientY) {
        const rect = this.element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = clientX - centerX
        const dyInverted = centerY - clientY
        let angleDeg = Math.atan2(dx, dyInverted) * 180 / Math.PI
        if (angleDeg < 0) {
            angleDeg += 360
        }
        return angleDeg
    }

    _handleInteractionStart (event) {
        // Controller sẽ xử lý việc `event.stopPropagation()` trên nút Start/Stop
        // để ngăn việc kéo dial khi nhấn nút.
        event.preventDefault()
        this._isDragging = true
        this.element.style.cursor = 'grabbing'
        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        this._previousPointerAngle = this._getAngleFromEvent(clientX, clientY)
    }

    _handleInteractionMove (event) {
        if (!this._isDragging) return
        event.preventDefault()

        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        const currentPointerAngle = this._getAngleFromEvent(clientX, clientY)

        let deltaAngle = currentPointerAngle - this._previousPointerAngle
        if (Math.abs(deltaAngle) > 180) {
            deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
        }

        const newRotation = this._currentRotation + deltaAngle
        this.setRotation(newRotation)

        let normalizedAngle = -this._currentRotation % 360
        if (normalizedAngle < 0) {
            normalizedAngle += 360
        }
        // Thông báo cho thế giới bên ngoài về sự thay đổi
        this.onAngleChanged(normalizedAngle)

        this._previousPointerAngle = currentPointerAngle
    }

    _handleInteractionEnd () {
        if (!this._isDragging) return
        this._isDragging = false
        this.element.style.cursor = 'grab'
    }
}