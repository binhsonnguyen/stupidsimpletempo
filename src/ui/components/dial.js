import * as config from "../../infrastructure/config";

export class Dial {
    constructor ({
                     element,
                     layersToRotate = [],
                     onDialChangeToNewBpmValue = () => {}
                 }) {
        if (!element) {
            throw new Error('Dial component yêu cầu có một element.')
        }
        this.element = element
        this.layersToRotate = layersToRotate
        this.onDialChangeToNewBpmValue = onDialChangeToNewBpmValue

        this._isDragging = false
        this._previousPointerAngle = 0
        this._currentRotation = 0

        this._handleInteractionStart = this._handleInteractionStart.bind(this)
        this._handleInteractionMove = this._handleInteractionMove.bind(this)
        this._handleInteractionEnd = this._handleInteractionEnd.bind(this)

        this._setupListeners()
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
        if (this.element !== event.target && !this.layersToRotate.includes(event.target)) {
            return
        }

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

        const displayAngle = ((-this._currentRotation % 360) + 360) % 360;
        this._previousPointerAngle = currentPointerAngle

        const newBpmValue = this._angleToBpmValue(displayAngle); // Hoặc this._angleToBpmValue(this._currentRotation)

        if (newBpmValue !== undefined) {
            this.onDialChangeToNewBpmValue(newBpmValue);
        }
    }

    _handleInteractionEnd () {
        if (!this._isDragging) return
        this._isDragging = false
        this.element.style.cursor = 'grab'
    }

    _angleToBpmValue(angle) {
        const {
            ANGLE_FOR_0_BPM_MARK,
            ANGLE_FOR_MIN_SCALE_BPM_MARK,
            ANGLE_FOR_MAX_SCALE_BPM_MARK,
            MIN_SCALE_BPM,
            MAX_SCALE_BPM
        } = config

        let normalizedAngle = Math.round(angle);
        normalizedAngle = ((normalizedAngle % 360) + 360) % 360;

        if (normalizedAngle === ANGLE_FOR_0_BPM_MARK) {
            return undefined
        }

        let newBpmCandidate

        if (angle > ANGLE_FOR_0_BPM_MARK && angle < ANGLE_FOR_MIN_SCALE_BPM_MARK) {
            newBpmCandidate = MIN_SCALE_BPM
        } else if (angle >= ANGLE_FOR_MIN_SCALE_BPM_MARK && angle <= ANGLE_FOR_MAX_SCALE_BPM_MARK) {
            const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM
            const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK

            if (angleScaleRange <= 0 || bpmScaleRange < 0) {
                newBpmCandidate = MIN_SCALE_BPM
            } else {
                const percentageInAngleRange = (angle - ANGLE_FOR_MIN_SCALE_BPM_MARK) / angleScaleRange
                const calculatedBpm = MIN_SCALE_BPM + percentageInAngleRange * bpmScaleRange
                newBpmCandidate = Math.round(calculatedBpm)
            }
            newBpmCandidate = Math.max(MIN_SCALE_BPM, Math.min(MAX_SCALE_BPM, newBpmCandidate))
        } else {
            newBpmCandidate = MAX_SCALE_BPM
        }

        return newBpmCandidate
    }

}