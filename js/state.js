export let currentBpm = 120
export const minBpm = 20
export const maxBpm = 300
export let isMetronomeRunning = false

export let currentDialRotation = 0 // Góc xoay vật lý của dial
export let effectiveKnobAngleOnDialScale = 0 // Góc (0-359) trên thang đo dial mà kim đang chỉ vào

export function setCurrentBpm(newBpm) {
    currentBpm = Math.max(minBpm, Math.min(maxBpm, newBpm))
}

export function setIsMetronomeRunning(running) {
    isMetronomeRunning = running
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
