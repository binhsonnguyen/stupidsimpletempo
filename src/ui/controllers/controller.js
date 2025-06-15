/**
 * Module này chứa các hàm xử lý (handlers) cấp cao,
 * được các component giao diện gọi khi có tương tác của người dùng.
 * Các hàm này kết nối hành động của người dùng với các use case của ứng dụng.
 */

import {dependencies} from "../../container";
import * as config from "../../infrastructure/config";

/**
 * Xử lý sự kiện khi StartButton được nhấn.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 */
export async function handleButtonTap ({ useCases, presenter, audioService }) {
    useCases.toggleMetronome()
    presenter.renderApp()
}

/**
 * Xử lý sự kiện khi góc của Dial bị thay đổi.
 * @param {object} dependencies - Các phụ thuộc cần thiết.
 * @param {number} angle - Góc mới do Dial cung cấp.
 */
export function handleAngleChanged ({ useCases, presenter }, angle) {
    const {
        ANGLE_FOR_0_BPM_MARK,
        ANGLE_FOR_MIN_SCALE_BPM_MARK,
        ANGLE_FOR_MAX_SCALE_BPM_MARK,
        MIN_SCALE_BPM,
        MAX_SCALE_BPM
    } = config

    const normolizedAngle = Math.round(angle) % 360

    if (normolizedAngle === ANGLE_FOR_0_BPM_MARK) {
        return
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

    useCases.changeBpm(newBpmCandidate)

    presenter.renderApp()
}

export function registerServiceWorker() {
    navigator.serviceWorker
        .register(new URL('../../infrastructure/services/sw.js', import.meta.url))
        .then(() => {
            console.log('Service worker has been registered.')
        })
}

export function wakeLockServiceRequest() {
    if (dependencies.metronome.isRunning && document.visibilityState === 'visible') {
        dependencies.wakeLockService.request().then(() => { })
    }
}