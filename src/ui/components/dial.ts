// /src/ui/components/dial.ts
import * as configModule from "../../infrastructure/config"; // Đổi tên để tránh xung đột

// Định nghĩa kiểu cho các hằng số từ config mà Dial sử dụng
// Tốt nhất là bạn nên có một tệp config.ts export các giá trị này với kiểu rõ ràng.
interface DialConfig {
    ANGLE_FOR_0_BPM_MARK: number;
    ANGLE_FOR_MIN_SCALE_BPM_MARK: number;
    ANGLE_FOR_MAX_SCALE_BPM_MARK: number;
    MIN_SCALE_BPM: number;
    MAX_SCALE_BPM: number;
}

// Giả sử configModule là một đối tượng tuân theo DialConfig
// Nếu không, bạn cần đảm bảo configModule.ts export đúng các giá trị này với kiểu number.
const config: DialConfig = configModule as any; // Ép kiểu tạm thời, nên sửa config.ts

// Định nghĩa kiểu cho tham số của constructor
interface DialConstructorParams {
    element: HTMLElement; // Element là bắt buộc
    layersToRotate?: (HTMLElement | null)[]; // Mảng các HTMLElement hoặc null, có thể không có
    onDialChangeToNewBpmValue?: (newBpm: number | undefined) => void; // Callback có thể nhận number hoặc undefined
}

export class Dial {
    private element: HTMLElement;
    private layersToRotate: HTMLElement[]; // Lọc bỏ null sau khi nhận
    private onDialChangeToNewBpmValue: (newBpm: number | undefined) => void;

    private _isDragging: boolean;
    private _previousPointerAngle: number;
    private _currentRotation: number; // Tổng góc xoay tích lũy của dial

    constructor({
                    element,
                    layersToRotate = [],
                    onDialChangeToNewBpmValue = () => {}
                }: DialConstructorParams) {
        if (!element) {
            // TypeScript sẽ báo lỗi nếu element không được cung cấp do kiểu DialConstructorParams
            // nhưng kiểm tra runtime vẫn tốt để phòng trường hợp JavaScript thuần gọi
            throw new Error('Dial component yêu cầu có một element.');
        }
        this.element = element;
        // Lọc bỏ các giá trị null/undefined từ layersToRotate và ép kiểu
        this.layersToRotate = layersToRotate.filter(layer => layer !== null && layer !== undefined) as HTMLElement[];
        this.onDialChangeToNewBpmValue = onDialChangeToNewBpmValue;

        this._isDragging = false;
        this._previousPointerAngle = 0;
        this._currentRotation = 0;

        // bind(this) vẫn cần thiết nếu các hàm này được truyền làm callback mà không qua arrow function
        // hoặc nếu chúng được remove/add lại mà không giữ context.
        this._handleInteractionStart = this._handleInteractionStart.bind(this);
        this._handleInteractionMove = this._handleInteractionMove.bind(this);
        this._handleInteractionEnd = this._handleInteractionEnd.bind(this);

        this._setupListeners();
    }

    public setRotation(angle: number, useTransition: boolean = false): void {
        this._currentRotation = angle;
        const transformValue = `rotate(${angle}deg)`;

        this.layersToRotate.forEach(layer => {
            // layer ở đây đã được đảm bảo là HTMLElement do đã lọc ở constructor
            layer.style.transition = useTransition ? 'transform 0.3s ease-out' : 'none';
            layer.style.transform = transformValue;
        });
    }

    private _setupListeners(): void {
        this.element.addEventListener('mousedown', this._handleInteractionStart as EventListener);
        this.element.addEventListener('touchstart', this._handleInteractionStart as EventListener, { passive: false });
        document.addEventListener('mousemove', this._handleInteractionMove as EventListener);
        document.addEventListener('touchmove', this._handleInteractionMove as EventListener, { passive: false });
        document.addEventListener('mouseup', this._handleInteractionEnd as EventListener);
        document.addEventListener('touchend', this._handleInteractionEnd as EventListener);
        document.addEventListener('touchcancel', this._handleInteractionEnd as EventListener);
    }

    private _getAngleFromEvent(clientX: number, clientY: number): number {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dyInverted = centerY - clientY; // y-axis is inverted in screen coordinates
        let angleDeg = Math.atan2(dx, dyInverted) * 180 / Math.PI;
        if (angleDeg < 0) {
            angleDeg += 360; // Normalize to 0-360
        }
        return angleDeg;
    }

    private _handleInteractionStart(event: MouseEvent | TouchEvent): void {
        // Kiểm tra event.target có phải là HTMLElement không và có nằm trong element hoặc layersToRotate không
        const targetElement = event.target as HTMLElement;
        if (this.element !== targetElement && !this.layersToRotate.includes(targetElement)) {
            return;
        }

        event.preventDefault();
        this._isDragging = true;
        this.element.style.cursor = 'grabbing';

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        this._previousPointerAngle = this._getAngleFromEvent(clientX, clientY);
    }

    private _handleInteractionMove(event: MouseEvent | TouchEvent): void {
        if (!this._isDragging) return;
        event.preventDefault();

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const currentPointerAngle = this._getAngleFromEvent(clientX, clientY);

        let deltaAngle = currentPointerAngle - this._previousPointerAngle;
        // Normalize deltaAngle to be between -180 and 180 to get the shortest path
        if (Math.abs(deltaAngle) > 180) {
            deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360;
        }

        const newRotation = this._currentRotation + deltaAngle;
        this.setRotation(newRotation, false); // No transition during drag

        // displayAngle là góc trực quan (0-359) mà người dùng thấy,
        // nó ngược dấu với _currentRotation (góc xoay CSS)
        const displayAngle = ((-this._currentRotation % 360) + 360) % 360;
        this._previousPointerAngle = currentPointerAngle;

        const newBpmValue = this._angleToBpmValue(displayAngle);

        if (newBpmValue !== undefined) {
            this.onDialChangeToNewBpmValue(newBpmValue);
        }
    }

    private _handleInteractionEnd(): void {
        if (!this._isDragging) return;
        this._isDragging = false;
        this.element.style.cursor = 'grab';

        const currentDisplayAngle = ((-this._currentRotation % 360) + 360) % 360;
        const bpmAtRelease = this._angleToBpmValue(currentDisplayAngle);

        let targetDisplayAngle: number;
        if (bpmAtRelease !== undefined) {
            targetDisplayAngle = this._bpmToAngleValue(bpmAtRelease);
        } else {
            targetDisplayAngle = config.ANGLE_FOR_0_BPM_MARK;
        }

        let deltaDisplayAngle = targetDisplayAngle - currentDisplayAngle;
        if (deltaDisplayAngle > 180) {
            deltaDisplayAngle -= 360;
        } else if (deltaDisplayAngle < -180) {
            deltaDisplayAngle += 360;
        }

        // Vì _currentRotation và displayAngle ngược dấu, delta cho _currentRotation sẽ là -deltaDisplayAngle.
        const finalRotationTarget = this._currentRotation - deltaDisplayAngle;

        this.setRotation(finalRotationTarget, true); // Apply smooth rotation

        const finalBpmToEmit = this._angleToBpmValue(targetDisplayAngle);
        this.onDialChangeToNewBpmValue(finalBpmToEmit);
    }

    private _angleToBpmValue(angle: number): number | undefined {
        const {
            ANGLE_FOR_0_BPM_MARK,
            ANGLE_FOR_MIN_SCALE_BPM_MARK,
            ANGLE_FOR_MAX_SCALE_BPM_MARK,
            MIN_SCALE_BPM,
            MAX_SCALE_BPM
        } = config;

        let normalizedAngle = Math.round(angle); // Làm tròn góc đầu vào
        normalizedAngle = ((normalizedAngle % 360) + 360) % 360; // Chuẩn hóa về 0-359

        if (normalizedAngle === ANGLE_FOR_0_BPM_MARK) {
            return undefined; // Điểm 0 BPM
        }

        let newBpmCandidate: number;

        // Logic xác định BPM dựa trên góc
        // Lưu ý: Các điều kiện so sánh góc cần chính xác.
        // Ví dụ, nếu ANGLE_FOR_0_BPM_MARK là 270, MIN_SCALE là 271, MAX_SCALE là 269 (qua điểm 0/360)
        // logic này cần được điều chỉnh để xử lý trường hợp vòng qua 0/360 độ.
        // Hiện tại, giả sử các góc tăng dần một cách tuyến tính.

        // Trường hợp góc nằm giữa điểm 0 BPM và MIN_SCALE_BPM
        if (ANGLE_FOR_MIN_SCALE_BPM_MARK > ANGLE_FOR_0_BPM_MARK) { // Thang đo không vòng qua 0 độ
            if (normalizedAngle > ANGLE_FOR_0_BPM_MARK && normalizedAngle < ANGLE_FOR_MIN_SCALE_BPM_MARK) {
                newBpmCandidate = MIN_SCALE_BPM;
            } else if (normalizedAngle >= ANGLE_FOR_MIN_SCALE_BPM_MARK && normalizedAngle <= ANGLE_FOR_MAX_SCALE_BPM_MARK) {
                // Nội suy trong khoảng MIN và MAX
                const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM;
                const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK;
                if (angleScaleRange <= 0 || bpmScaleRange < 0) { // Config không hợp lệ
                    newBpmCandidate = MIN_SCALE_BPM;
                } else {
                    const percentageInAngleRange = (normalizedAngle - ANGLE_FOR_MIN_SCALE_BPM_MARK) / angleScaleRange;
                    const calculatedBpm = MIN_SCALE_BPM + percentageInAngleRange * bpmScaleRange;
                    newBpmCandidate = Math.round(calculatedBpm);
                }
            } else { // Góc lớn hơn MAX_SCALE_BPM (hoặc nhỏ hơn 0_BPM_MARK nếu thang đo không vòng)
                newBpmCandidate = MAX_SCALE_BPM;
            }
        } else { // Thang đo vòng qua 0 độ (ví dụ: 0_BPM ở 270, MIN_BPM ở 271, MAX_BPM ở 269)
            // Logic này cần được xem xét cẩn thận dựa trên giá trị config cụ thể
            // Đây là một ví dụ đơn giản hóa, có thể cần phức tạp hơn
            if ((normalizedAngle > ANGLE_FOR_0_BPM_MARK && normalizedAngle < 360) || (normalizedAngle >= 0 && normalizedAngle < ANGLE_FOR_MIN_SCALE_BPM_MARK)) {
                newBpmCandidate = MIN_SCALE_BPM;
            } else if (normalizedAngle >= ANGLE_FOR_MIN_SCALE_BPM_MARK || normalizedAngle <= ANGLE_FOR_MAX_SCALE_BPM_MARK) { // Bao gồm cả hai phía của điểm 0
                // Cần logic nội suy phức tạp hơn nếu thang đo vòng qua 0 độ
                // Tạm thời sử dụng logic đơn giản:
                const effectiveAngle = normalizedAngle >= ANGLE_FOR_MIN_SCALE_BPM_MARK ? normalizedAngle : normalizedAngle + 360;
                const effectiveMaxAngle = ANGLE_FOR_MAX_SCALE_BPM_MARK < ANGLE_FOR_MIN_SCALE_BPM_MARK ? ANGLE_FOR_MAX_SCALE_BPM_MARK + 360 : ANGLE_FOR_MAX_SCALE_BPM_MARK;

                const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM;
                const angleScaleRange = effectiveMaxAngle - ANGLE_FOR_MIN_SCALE_BPM_MARK;

                if (angleScaleRange <= 0 || bpmScaleRange < 0) {
                    newBpmCandidate = MIN_SCALE_BPM;
                } else {
                    const percentageInAngleRange = (effectiveAngle - ANGLE_FOR_MIN_SCALE_BPM_MARK) / angleScaleRange;
                    const calculatedBpm = MIN_SCALE_BPM + percentageInAngleRange * bpmScaleRange;
                    newBpmCandidate = Math.round(calculatedBpm);
                }
            } else {
                newBpmCandidate = MAX_SCALE_BPM;
            }
        }
        // Đảm bảo giá trị nằm trong khoảng min/max BPM
        return Math.max(MIN_SCALE_BPM, Math.min(MAX_SCALE_BPM, newBpmCandidate));
    }

    private _bpmToAngleValue(bpm: number | undefined): number {
        const {
            ANGLE_FOR_0_BPM_MARK,
            ANGLE_FOR_MIN_SCALE_BPM_MARK,
            ANGLE_FOR_MAX_SCALE_BPM_MARK,
            MIN_SCALE_BPM,
            MAX_SCALE_BPM
        } = config;

        if (bpm === undefined) {
            return ANGLE_FOR_0_BPM_MARK;
        }
        if (bpm <= MIN_SCALE_BPM) {
            return ANGLE_FOR_MIN_SCALE_BPM_MARK;
        }
        if (bpm >= MAX_SCALE_BPM) {
            return ANGLE_FOR_MAX_SCALE_BPM_MARK;
        }

        // Nội suy ngược
        const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM;
        const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK;

        if (bpmScaleRange <= 0 || angleScaleRange <= 0) { // Config không hợp lệ hoặc MIN_BPM = MAX_BPM
            return ANGLE_FOR_MIN_SCALE_BPM_MARK; // Fallback
        }

        const percentageInBpmRange = (bpm - MIN_SCALE_BPM) / bpmScaleRange;
        let calculatedAngle = ANGLE_FOR_MIN_SCALE_BPM_MARK + percentageInBpmRange * angleScaleRange;

        // Xử lý trường hợp thang đo vòng qua 0 độ (nếu ANGLE_FOR_MAX_SCALE_BPM_MARK < ANGLE_FOR_MIN_SCALE_BPM_MARK)
        if (ANGLE_FOR_MAX_SCALE_BPM_MARK < ANGLE_FOR_MIN_SCALE_BPM_MARK) {
            const totalAngleRange = (360 - ANGLE_FOR_MIN_SCALE_BPM_MARK) + ANGLE_FOR_MAX_SCALE_BPM_MARK;
            calculatedAngle = ANGLE_FOR_MIN_SCALE_BPM_MARK + percentageInBpmRange * totalAngleRange;
            if (calculatedAngle >= 360) {
                calculatedAngle -= 360;
            }
        }
        return Math.round(calculatedAngle);
    }
}