import * as config from '../../config.js'

export class Dial {
    constructor ({
                     element,
                     layersToRotate = [],
                     tickMarkLayerElement,
                     labelLayerElement,
                     onAngleChanged = () => {}
                 }) {
        if (!element) {
            throw new Error('Dial component yêu cầu có một element.')
        }
        if (!tickMarkLayerElement) {
            console.warn('Dial component: tickMarkLayerElement không được cung cấp. Vạch chia sẽ không được tạo.')
        }
        if (!labelLayerElement) {
            console.warn('Dial component: labelLayerElement không được cung cấp. Nhãn sẽ không được tạo.')
        }

        this.element = element
        this.layersToRotate = layersToRotate
        this.tickMarkLayerElement = tickMarkLayerElement
        this.labelLayerElement = labelLayerElement
        this.onAngleChanged = onAngleChanged

        this._isDragging = false
        this._previousPointerAngle = 0
        this._currentRotation = 0

        this._handleInteractionStart = this._handleInteractionStart.bind(this)
        this._handleInteractionMove = this._handleInteractionMove.bind(this)
        this._handleInteractionEnd = this._handleInteractionEnd.bind(this)

        this._setupListeners()
        this._createTickMarks()
    }

    setRotation (angle) {
        this._currentRotation = angle
        const transformValue = `rotate(${angle}deg)`
        this.layersToRotate.forEach(layer => {
            if (layer) {
                layer.style.transform = transformValue
            }
        })
    }

    _setupListeners () {
        this.element.addEventListener('mousedown', this._handleInteractionStart)
        this.element.addEventListener('touchstart', this._handleInteractionStart, { passive: false })
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

        const normalizedAngle = ((-this._currentRotation % 360) + 360) % 360
        this.onAngleChanged(normalizedAngle)
        this._previousPointerAngle = currentPointerAngle
    }

    _handleInteractionEnd () {
        if (!this._isDragging) return
        this._isDragging = false
        this.element.style.cursor = 'grab'
    }

    _createTickMarks () {
        if (!this.tickMarkLayerElement || !this.labelLayerElement) {
            console.warn('Dial._createTickMarks: Thiếu tickMarkLayerElement hoặc labelLayerElement để dọn dẹp.')
            return
        }

        this.labelLayerElement.innerHTML = ''

        const referenceElementForSize = this.element
        const layerWidth = referenceElementForSize.offsetWidth
        const layerHeight = referenceElementForSize.offsetHeight
        const layerCenterX = layerWidth / 2
        const layerCenterY = layerHeight / 2

        const marks = []

        marks.push({
            bpm: config.BPM_VALUE_FOR_0_DEG_MARK,
            angle: config.ANGLE_FOR_0_BPM_MARK,
            type: 'large',
            needsLabel: true
        })

        marks.push({
            bpm: config.MIN_SCALE_BPM,
            angle: config.ANGLE_FOR_MIN_SCALE_BPM_MARK,
            type: 'large',
            needsLabel: true
        })

        const bpmScaleRange = config.MAX_SCALE_BPM - config.MIN_SCALE_BPM
        const angleScaleRange = config.ANGLE_FOR_MAX_SCALE_BPM_MARK - config.ANGLE_FOR_MIN_SCALE_BPM_MARK
        let effectiveDegreesPerBpmOnScale = 0

        if (bpmScaleRange > 0 && angleScaleRange !== 0) {
            effectiveDegreesPerBpmOnScale = angleScaleRange / bpmScaleRange
        } else if (!(bpmScaleRange === 0 && angleScaleRange === 0)) {
            console.warn('Kiểm tra lại cấu hình thang đo BPM trong config.js.')
        }

        if (bpmScaleRange > 0 && effectiveDegreesPerBpmOnScale !== 0) {
            for (let bpmValue = config.MIN_SCALE_BPM + 5; bpmValue < config.MAX_SCALE_BPM; bpmValue += 5) {
                const angle = config.ANGLE_FOR_MIN_SCALE_BPM_MARK +
                    (bpmValue - config.MIN_SCALE_BPM) * effectiveDegreesPerBpmOnScale
                const isLargeTick = (bpmValue % 10 === 0)
                const type = isLargeTick ? 'large' : 'small'
                const needsLabelForIntermediate = isLargeTick &&
                    bpmValue >= 60 &&
                    (bpmValue % 20 === 0)
                marks.push({ bpm: bpmValue, angle: angle, type: type, needsLabel: needsLabelForIntermediate })
            }
        }

        if (config.MAX_SCALE_BPM !== config.MIN_SCALE_BPM || config.ANGLE_FOR_MAX_SCALE_BPM_MARK !== config.ANGLE_FOR_MIN_SCALE_BPM_MARK) {
            marks.push({
                bpm: config.MAX_SCALE_BPM,
                angle: config.ANGLE_FOR_MAX_SCALE_BPM_MARK,
                type: 'large',
                needsLabel: true
            })
        }
    }
}