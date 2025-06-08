import * as config from '../config.js'
import { soundFactory } from './soundFactory.js'

let audioContextInstance = null
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

// === Các biến trạng thái cho scheduler ===
let currentBeat = null
let isRunningCallback = () => false
let getBpmCallback = () => config.MIN_SCALE_BPM

// === Bộ định thời đã được nâng cấp để dùng soundFactory ===
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

        // 1. Yêu cầu "nhà máy" cung cấp đúng đối tượng Sound cần thiết
        const sound = soundFactory.getSound({
            note: currentBeat.note,
            oscillatorType: config.BEAT_OSCILLATOR_TYPE
        })

        // 2. Ra lệnh cho đối tượng Sound tự chơi
        if (sound) {
            sound.play(nextNoteTimestamp, currentBeat.gain)
        }

        // 3. Tính toán và di chuyển đến beat tiếp theo
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

            // Khởi tạo nhà máy âm thanh ngay khi có context
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