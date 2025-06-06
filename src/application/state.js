import { MIN_SCALE_BPM, ANGLE_FOR_MIN_SCALE_BPM_MARK } from '../infrastructure/config.js'
import {logger} from "../infrastructure/logger";

export let currentBpm = MIN_SCALE_BPM
export let isMetronomeRunning = false
export let currentDialRotation = 0
export let effectiveKnobAngleOnDialScale = 0
export let wakeLockSentinel = null

export function setCurrentBpm(newBpm) {
    const clampedBpm = Math.max(config.MIN_SCALE_BPM, Math.min(config.MAX_SCALE_BPM, newBpm))
    currentBpm = newBpm
}

export function setIsMetronomeRunning(running) {
    isMetronomeRunning = running
}

export function setWakeLockSentinel(sentinel) {
    wakeLockSentinel = sentinel
}

export function setCurrentDialRotation(rotation) {
    currentDialRotation = rotation

    let normalizedAngle = -currentDialRotation % 360
    if (normalizedAngle < 0) {
        normalizedAngle += 360
    }
    effectiveKnobAngleOnDialScale = normalizedAngle

    logger.log(`Rotation State Updated -> raw: ${rotation.toFixed(2)}, effective: ${effectiveKnobAngleOnDialScale.toFixed(2)}`)
}