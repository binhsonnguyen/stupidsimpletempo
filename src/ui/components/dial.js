import * as config from "../../infrastructure/config";
import {logger} from "../../infrastructure/logger";

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

    setRotation (angle, useTransition = false) { // Thêm tham số useTransition
        this._currentRotation = angle;
        const transformValue = `rotate(${angle}deg)`;

        this.layersToRotate.forEach(layer => {
            if (!!layer) {
                layer.style.transition = useTransition ? 'transform 0.3s ease-out' : 'none';
                layer.style.transform = transformValue;
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
        this.setRotation(newRotation, false)

        const displayAngle = ((-this._currentRotation % 360) + 360) % 360;
        this._previousPointerAngle = currentPointerAngle

        const newBpmValue = this._angleToBpmValue(displayAngle);

        if (newBpmValue !== undefined) {
            this.onDialChangeToNewBpmValue(newBpmValue);
        }
    }

    _handleInteractionEnd () {
        if (!this._isDragging) return
        this._isDragging = false
        this.element.style.cursor = 'grab'

        // 1. Tính góc hiển thị hiện tại (0-359 độ)
        const currentDisplayAngle = ((-this._currentRotation % 360) + 360) % 360
        // 2. Xác định giá trị BPM tương ứng với góc hiển thị hiện tại
        const bpmAtRelease = this._angleToBpmValue(currentDisplayAngle);

        // 3. Xác định góc hiển thị đích (0-359 độ) mà dial sẽ snap tới
        let targetDisplayAngle
        if (bpmAtRelease !== undefined) {
            // Snap tới góc tương ứng với BPM đã làm tròn
            targetDisplayAngle = this._bpmToAngleValue(bpmAtRelease)
        } else {
            // Snap về vạch 0 BPM (hoặc điểm không xác định BPM)
            targetDisplayAngle = config.ANGLE_FOR_0_BPM_MARK;
        }

        // 4. Tính toán delta (sự thay đổi) cho góc hiển thị theo đường ngắn nhất
        let deltaDisplayAngle = targetDisplayAngle - currentDisplayAngle;

        // Đảm bảo deltaDisplayAngle nằm trong khoảng (-180, 180] để chọn cung ngắn nhất
        if (deltaDisplayAngle > 180) {
            deltaDisplayAngle -= 360
        } else if (deltaDisplayAngle < -180) {
            deltaDisplayAngle += 360
        }

        // 5. Tính giá trị _currentRotation cuối cùng.
        // Vì _currentRotation và displayAngle có mối quan hệ ngược dấu (display = -rotation),
        // nên delta cho _currentRotation sẽ là -deltaDisplayAngle.
        const finalRotationTarget = this._currentRotation - deltaDisplayAngle;

        // 6. Áp dụng phép xoay mượt mà tới vị trí đích
        this.setRotation(finalRotationTarget, true)

        // 7. Emit giá trị BPM cuối cùng sau khi snap.
        // Giá trị này nên được tính từ targetDisplayAngle để đảm bảo tính nhất quán.
        const finalBpmToEmit = this._angleToBpmValue(targetDisplayAngle)
        this.onDialChangeToNewBpmValue(finalBpmToEmit);
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

    /**
     * Chuyển đổi một giá trị BPM (đã được làm tròn) thành góc (đã làm tròn, 0-359) tương ứng trên dial.
     * @param {number|undefined} bpm - Giá trị BPM (kết quả từ _angleToBpmValue).
     * @returns {number} Góc (số nguyên, 0-359) tương ứng trên dial.
     */
    _bpmToAngleValue(bpm) {
        const {
            ANGLE_FOR_0_BPM_MARK,
            ANGLE_FOR_MIN_SCALE_BPM_MARK,
            ANGLE_FOR_MAX_SCALE_BPM_MARK,
            MIN_SCALE_BPM,
            MAX_SCALE_BPM
        } = config;

        if (bpm === undefined) { // Tương ứng với ANGLE_FOR_0_BPM_MARK từ _angleToBpmValue
            return ANGLE_FOR_0_BPM_MARK;
        }

        // Dựa trên logic của _angleToBpmValue, nếu BPM là MIN hoặc MAX,
        // chúng ta snap tới các vạch chia tương ứng.
        if (bpm <= MIN_SCALE_BPM) {
            return ANGLE_FOR_MIN_SCALE_BPM_MARK;
        }
        if (bpm >= MAX_SCALE_BPM) {
            return ANGLE_FOR_MAX_SCALE_BPM_MARK;
        }

        // Nội suy ngược cho các giá trị BPM trong khoảng (MIN_SCALE_BPM, MAX_SCALE_BPM)
        // để tìm góc trong [ANGLE_FOR_MIN_SCALE_BPM_MARK, ANGLE_FOR_MAX_SCALE_BPM_MARK]
        const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM;
        const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK;

        // Kiểm tra để tránh chia cho 0 nếu config không hợp lệ
        if (bpmScaleRange <= 0 || angleScaleRange <= 0) {
            return ANGLE_FOR_MIN_SCALE_BPM_MARK; // Fallback an toàn
        }

        const percentageInBpmRange = (bpm - MIN_SCALE_BPM) / bpmScaleRange;
        const calculatedAngle = ANGLE_FOR_MIN_SCALE_BPM_MARK + percentageInBpmRange * angleScaleRange;

        // Làm tròn góc để snap vào "vạch" (độ nguyên) gần nhất.
        return Math.round(calculatedAngle);
    }
}