import * as config from '../config.js'

let audioContextInstance = null
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

// === Các biến trạng thái mới cho scheduler ===
let currentBeat = null
let isRunningCallback = () => false
let getBpmCallback = () => config.MIN_SCALE_BPM

function noteToFreq (note) {
    const noteMap = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }
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

// === playClickSound đã được khôi phục lại logic envelope gốc ===
function playClickSound (timeToPlay, { note, gain }) {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        return
    }

    try {
        const osc = audioContextInstance.createOscillator()
        const gainNode = audioContextInstance.createGain()
        const gainParam = gainNode.gain

        // --- Bắt đầu khối logic tạo âm bao gốc ---
        const soundDuration = 0.05
        const sustainDuration = soundDuration / 3
        const decayEndTime = timeToPlay + soundDuration
        const endVolume = 0.0001

        const sustainPoints = 10
        const randomAmplitude = 0.05
        const randomValues = new Float32Array(sustainPoints)

        for (let i = 0; i < sustainPoints; i++) {
            const randomFactor = (Math.random() - 0.5) * 2
            // Sử dụng `gain` từ đối tượng Beat thay vì giá trị cố định
            randomValues[i] = gain + (randomFactor * randomAmplitude)
        }
        randomValues[sustainPoints - 1] = gain // Điểm cuối cùng phải chính xác bằng gain

        gainParam.setValueCurveAtTime(randomValues, timeToPlay, sustainDuration)
        gainParam.exponentialRampToValueAtTime(endVolume, decayEndTime)
        // --- Kết thúc khối logic tạo âm bao gốc ---

        osc.type = config.BEAT_OSCILLATOR_TYPE
        osc.frequency.setValueAtTime(noteToFreq(note), timeToPlay)

        osc.connect(gainNode)
        gainNode.connect(audioContextInstance.destination)

        osc.start(timeToPlay)
        osc.stop(decayEndTime)
    } catch (e) {
        console.error('Lỗi trong playClickSound:', e)
    }
}

// === Bộ định thời được viết lại hoàn toàn ===
function audioScheduler () {
    if (!isRunningCallback()) {
        stop()
        return
    }

    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS) {
        if (!currentBeat) {
            console.error('Scheduler chạy mà không có beat nào, đang dừng...')
            stop()
            return
        }

        playClickSound(nextNoteTimestamp, { note: currentBeat.note, gain: currentBeat.gain })

        const bpm = getBpmCallback()
        const secondsPerBeat = (60.0 / bpm) * currentBeat.durationFactor

        nextNoteTimestamp += secondsPerBeat

        currentBeat = currentBeat.nextBeat
    }

    schedulerTimerId = setTimeout(audioScheduler, config.SCHEDULER_RUN_INTERVAL_MS)
}

export function initializeAudioContext () {
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
            console.error('Lỗi khi tạo AudioContext:', e)
            return false
        }
    }
    return true
}

export function getAudioContext () {
    return audioContextInstance
}

// === Hàm start được cập nhật để nhận chuỗi beat ===
export function start ({ getBpm, isRunning, beatSequence }) {
    if (!audioContextInstance || audioContextInstance.state !== 'running' || !beatSequence) {
        return false
    }
    isRunningCallback = isRunning
    getBpmCallback = getBpm
    currentBeat = beatSequence
    nextNoteTimestamp = audioContextInstance.currentTime + 0.1

    audioScheduler()
    return true
}

// === Hàm stop không thay đổi ===
export function stop () {
    clearTimeout(schedulerTimerId)
    schedulerTimerId = null
}