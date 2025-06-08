import * as config from '../config.js'
import { soundFactory } from './soundFactory.js'

let audioContextInstance = null
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

// === Các biến trạng thái cho scheduler ===
let currentBeat = null
let isRunningCallback = () => false
let getBpmCallback = () => config.MIN_SCALE_BPM

// === "Bộ phiên dịch" từ Beat Type sang thuộc tính âm thanh, đọc từ config ===
const BEAT_SOUND_MAP = {
    accent: { note: config.ACCENT_BEAT_NOTE, gain: config.ACCENT_BEAT_GAIN },
    regular: { note: config.REGULAR_BEAT_NOTE, gain: config.REGULAR_BEAT_GAIN }
}

// === Bộ định thời đã được nâng cấp để diễn giải Beat Type ===
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

        // 1. "Diễn giải" loại beat thành các thuộc tính âm thanh cụ thể
        const soundProps = BEAT_SOUND_MAP[currentBeat.type] || BEAT_SOUND_MAP.regular

        // 2. Yêu cầu "nhà máy" cung cấp âm thanh với nốt đã được diễn giải
        const sound = soundFactory.getSound({
            note: soundProps.note,
            oscillatorType: config.BEAT_OSCILLATOR_TYPE.value
        })

        // 3. Ra lệnh cho âm thanh chơi với cường độ đã được diễn giải
        if (sound) {
            sound.play(nextNoteTimestamp, soundProps.gain)
        }

        // 4. Tính toán và di chuyển đến beat tiếp theo
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

            soundFactory.init({ audioContext: audioContextInstance })

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

export function stop () {
    clearTimeout(schedulerTimerId)
    schedulerTimerId = null
}