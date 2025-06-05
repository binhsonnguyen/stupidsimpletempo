export let currentBpm = 120
export const minBpm = 20
export const maxBpm = 300
export let isMetronomeRunning = false
export let currentDialRotation = 0 // Thêm trạng thái góc xoay trực quan

export function setCurrentBpm(newBpm) {
    currentBpm = Math.max(minBpm, Math.min(maxBpm, newBpm))
}

export function setIsMetronomeRunning(running) {
    isMetronomeRunning = running
}

export function setCurrentDialRotation(rotation) {
    currentDialRotation = rotation
}