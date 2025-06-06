// src/infrastructure/audio/audioService.js

import * as config from '../config.js'

let audioContextInstance
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

function noteToFreq(note) {
    const noteMap = { 'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2 }
    const referenceOctave = 4
    const referenceFreq = 440

    const match = note.match(/^([A-G])([#b]*)(\d+)$/i)
    if (!match) {
        return referenceFreq
    }

    const noteName = match[1].toUpperCase()
    const accidentals = match[2]
    const octave = parseInt(match[3], 10)

    let semitoneOffset = noteMap[noteName]
    if (semitoneOffset == null) {
        return referenceFreq
    }

    for (const accidental of accidentals) {
        if (accidental === '#') {
            semitoneOffset++
        } else if (accidental === 'b') {
            semitoneOffset--
        }
    }

    const semitonesFromA4 = semitoneOffset + (octave - referenceOctave) * 12
    return referenceFreq * Math.pow(2, semitonesFromA4 / 12)
}

function playClickSound(timeToPlay) {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        return
    }

    try {
        const osc = audioContextInstance.createOscillator()
        const gain = audioContextInstance.createGain()
        const gainParam = gain.gain

        const initialVolume = config.INITIAL_AUDIO_GAIN
        const soundDuration = 0.05
        const sustainDuration = soundDuration / 3
        const decayEndTime = timeToPlay + soundDuration
        const endVolume = 0.0001

        const sustainPoints = 10
        const randomAmplitude = 0.05
        const randomValues = new Float32Array(sustainPoints)

        for (let i = 0; i < sustainPoints; i++) {
            const randomFactor = (Math.random() - 0.5) * 2
            randomValues[i] = initialVolume + (randomFactor * randomAmplitude)
        }
        randomValues[sustainPoints - 1] = initialVolume

        gainParam.setValueCurveAtTime(randomValues, timeToPlay, sustainDuration)
        gainParam.exponentialRampToValueAtTime(endVolume, decayEndTime)

        osc.type = config.BEAT_OSCILLATOR_TYPE
        const frequency = noteToFreq(config.BEAT_NOTE)
        osc.frequency.setValueAtTime(frequency, timeToPlay)

        osc.connect(gain)
        gain.connect(audioContextInstance.destination)

        osc.start(timeToPlay)
        osc.stop(decayEndTime)
    } catch (e) {
        console.error('Lỗi trong playClickSound:', e)
    }
}

function audioScheduler(getBpm, isRunning) {
    if (!audioContextInstance || !isRunning() || audioContextInstance.state !== 'running') {
        clearTimeout(schedulerTimerId)
        return
    }

    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS) {
        playClickSound(nextNoteTimestamp)
        const secondsPerBeat = 60.0 / getBpm()
        nextNoteTimestamp += secondsPerBeat
    }
    schedulerTimerId = setTimeout(() => audioScheduler(getBpm, isRunning), config.SCHEDULER_RUN_INTERVAL_MS)
}

export function initializeAudioContext() {
    if (!audioContextInstance) {
        try {
            audioContextInstance = new (window.AudioContext || window.webkitAudioContext)()
            if (!audioContextInstance) {
                return false
            }
            audioContextInstance.onstatechange = () => {
                console.log('Trạng thái AudioContext đã thay đổi thành:', audioContextInstance.state)
            }
        } catch (e) {
            console.error("Lỗi khi tạo AudioContext:", e)
            return false
        }
    }
    return true
}

export function getAudioContext() {
    return audioContextInstance
}

export function start(getBpm, isRunning) {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        return false
    }
    nextNoteTimestamp = audioContextInstance.currentTime + 0.1
    audioScheduler(getBpm, isRunning)
    return true
}

export function stop() {
    clearTimeout(schedulerTimerId)
}