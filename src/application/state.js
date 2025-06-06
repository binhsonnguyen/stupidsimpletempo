import { MIN_SCALE_BPM } from '../infrastructure/config.js'

export let currentBpm = MIN_SCALE_BPM

export let isMetronomeRunning = false

export let currentDialRotation = 0
export let effectiveKnobAngleOnDialScale = 0

export let wakeLockSentinel = null

export function setCurrentBpm(newBpm) {
    // Giới hạn BPM trong khoảng min/max của thang đo từ config
    currentBpm = Math.max(config.MIN_SCALE_BPM, Math.min(config.MAX_SCALE_BPM, newBpm))
}

export function setIsMetronomeRunning(running) {
    isMetronomeRunning = running
}

export function setWakeLockSentinel(sentinel) {
    wakeLockSentinel = sentinel
}

export function setCurrentDialRotation(rotation) {
    currentDialRotation = rotation
    let normalizedAngle = (currentDialRotation % 360 + 360) % 360
    effectiveKnobAngleOnDialScale = normalizedAngle
}