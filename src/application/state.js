import { ANGLE_FOR_MIN_SCALE_BPM_MARK } from '../infrastructure/config.js'

export let currentDialRotation = ANGLE_FOR_MIN_SCALE_BPM_MARK
export let effectiveKnobAngleOnDialScale = ANGLE_FOR_MIN_SCALE_BPM_MARK

export function setCurrentDialRotation(rotation) {
    currentDialRotation = rotation

    let normalizedAngle = currentDialRotation % 360
    if (normalizedAngle < 0) {
        normalizedAngle += 360
    }
    effectiveKnobAngleOnDialScale = normalizedAngle
}