import * as state from './state.js'
import * as config from './config.js'

let audioContextInstance
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

export function initializeAudioContext() {
    if (!audioContextInstance) {
        audioContextInstance = new (window.AudioContext || window.webkitAudioContext)()
        if (!audioContextInstance) {
            alert("Trình duyệt của bạn không hỗ trợ Web Audio API.")
            return false
        }
    }
    return true
}

function playClickSound(time) {
    if (!audioContextInstance) return

    const oscillatorNode = audioContextInstance.createOscillator()
    const gainControlNode = audioContextInstance.createGain()

    oscillatorNode.connect(gainControlNode)
    gainControlNode.connect(audioContextInstance.destination)

    oscillatorNode.type = 'sine'
    oscillatorNode.frequency.setValueAtTime(660, time)
    gainControlNode.gain.setValueAtTime(0.6, time)

    oscillatorNode.start(time)
    oscillatorNode.stop(time + 0.03)
}

function audioScheduler() {
    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS && state.isMetronomeRunning) {
        playClickSound(nextNoteTimestamp)
        const secondsPerBeat = 60.0 / state.currentBpm
        nextNoteTimestamp += secondsPerBeat
    }
    if (state.isMetronomeRunning) {
        schedulerTimerId = setTimeout(audioScheduler, config.SCHEDULER_RUN_INTERVAL_MS)
    }
}

export function startAudio() {
    if (audioContextInstance.state === 'suspended') {
        audioContextInstance.resume()
    }
    state.setIsMetronomeRunning(true)
    nextNoteTimestamp = audioContextInstance.currentTime + 0.05
    audioScheduler()
}

export function stopAudio() {
    state.setIsMetronomeRunning(false)
    clearTimeout(schedulerTimerId)
}