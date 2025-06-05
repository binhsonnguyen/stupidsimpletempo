import * as state from './state.js'
import * as config from './config.js' // Đảm bảo bạn đã import config

let audioContextInstance
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

export function initializeAudioContext() {
    if (!audioContextInstance) {
        try {
            audioContextInstance = new (window.AudioContext || window.webkitAudioContext)()
            if (!audioContextInstance) {
                console.error("Trình duyệt không hỗ trợ Web Audio API.")
                return false
            }
            console.log('AudioContext vừa được khởi tạo. Trạng thái ban đầu:', audioContextInstance.state)
            audioContextInstance.onstatechange = () => { // Lắng nghe thay đổi trạng thái
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

function audioScheduler() {
    if (!audioContextInstance || !state.isMetronomeRunning || audioContextInstance.state !== 'running') {
        console.log(`audioScheduler dừng: isMetronomeRunning=<span class="math-inline">\{state\.isMetronomeRunning\}, audioCtxState\=</span>{audioContextInstance ? audioContextInstance.state : 'null'}`)
        clearTimeout(schedulerTimerId)
        return
    }

    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS) {
        playClickSound(nextNoteTimestamp)
        const secondsPerBeat = 60.0 / state.currentBpm
        nextNoteTimestamp += secondsPerBeat
    }
    schedulerTimerId = setTimeout(audioScheduler, config.SCHEDULER_RUN_INTERVAL_MS)
}

export function startAudio() {
    if (!audioContextInstance) {
        console.error("startAudio được gọi nhưng AudioContext chưa được khởi tạo.")
        state.setIsMetronomeRunning(false)
        return false
    }
    if (audioContextInstance.state !== 'running') {
        console.warn(`startAudio được gọi khi trạng thái AudioContext là ${audioContextInstance.state}. Lẽ ra nó phải được resume bởi hàm gọi.`)
        state.setIsMetronomeRunning(false)
        return false
    }

    console.log("Bắt đầu lập lịch âm thanh. BPM:", state.currentBpm, "Thời gian AudioContext:", audioContextInstance.currentTime)
    state.setIsMetronomeRunning(true)
    nextNoteTimestamp = audioContextInstance.currentTime + 0.1 // Bắt đầu lên lịch sớm hơn một chút
    audioScheduler()
    return true
}

export function stopAudio() {
    console.log("Dừng lập lịch âm thanh.")
    state.setIsMetronomeRunning(false)
    clearTimeout(schedulerTimerId)
}

function playClickSound(timeToPlay) {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        // console.warn(`playClickSound bỏ qua: AudioContext không chạy. State: ${audioContextInstance ? audioContextInstance.state : 'null'}`)
        return
    }
    // console.log(`Đang cố phát âm thanh vào thời điểm: ${timeToPlay.toFixed(3)}, thời gian ctx hiện tại: ${audioContextInstance.currentTime.toFixed(3)}`)
    try {
        const osc = audioContextInstance.createOscillator()
        const gain = audioContextInstance.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, timeToPlay)
        gain.gain.setValueAtTime(0.5, timeToPlay)
        gain.gain.exponentialRampToValueAtTime(0.0001, timeToPlay + 0.05)

        osc.connect(gain)
        gain.connect(audioContextInstance.destination)

        osc.start(timeToPlay)
        osc.stop(timeToPlay + 0.05)
    } catch (e) {
        console.error('Lỗi trong playClickSound:', e)
    }
}