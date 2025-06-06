import { MIN_SCALE_BPM, MAX_SCALE_BPM } from './config.js' // Import các hằng số cần thiết

export let currentBpm = MIN_SCALE_BPM
export const minBpm = MIN_SCALE_BPM
export const maxBpm = MAX_SCALE_BPM
export let isMetronomeRunning = false

export let currentDialRotation = 0 // Góc xoay vật lý của dial
export let effectiveKnobAngleOnDialScale = 0 // Góc (0-359) trên thang đo dial mà kim đang chỉ vào

export let wakeLockSentinel = null

export function setCurrentBpm(newBpm) {
    currentBpm = Math.max(minBpm, Math.min(maxBpm, newBpm))
}

export function setIsMetronomeRunning(running) {
    isMetronomeRunning = running
}

export function setWakeLockSentinel(sentinel) {
    wakeLockSentinel = sentinel
}

export function setCurrentDialRotation(rotation) {
    console.log("rotation", rotation)
    currentDialRotation = rotation
    let normalizedAngle = -currentDialRotation % 360
    if (normalizedAngle < 0) {
        normalizedAngle += 360
    }
    effectiveKnobAngleOnDialScale = normalizedAngle
}
