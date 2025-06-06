import * as state from './state.js'
import * as config from './config.js'
import {BEAT_OSCILLATOR_TYPE, INITIAL_AUDIO_GAIN} from "./config.js"; // Đảm bảo bạn đã import config

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

function noteToFreq(note) {
    const noteMap = { 'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2 }
    const referenceOctave = 4
    const referenceFreq = 440 // A4 = 440 Hz

    const match = note.match(/^([A-G])([#b]*)(\d+)$/i)
    if (!match) {
        console.warn(`Định dạng nốt không hợp lệ: "${note}". Sử dụng mặc định A4.`)
        return referenceFreq
    }

    const noteName = match[1].toUpperCase()
    const accidentals = match[2]
    const octave = parseInt(match[3], 10)

    let semitoneOffset = noteMap[noteName]
    if (semitoneOffset == null) {
        console.warn(`Tên nốt không hợp lệ: "${noteName}". Sử dụng mặc định A4.`)
        return referenceFreq
    }

    // Áp dụng dấu thăng (#) hoặc giáng (b)
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

        // --- Các tham số cho đường bao âm lượng ---
        const initialVolume = config.INITIAL_AUDIO_GAIN // Âm lượng ban đầu (60%)
        const soundDuration = 0.05 // Tổng thời gian của tiếng beat (giây)
        const sustainDuration = soundDuration / 3 // Thời gian của giai đoạn Sustain (1/3 đầu)
        const decayEndTime = timeToPlay + soundDuration // Thời điểm kết thúc hoàn toàn
        const endVolume = 0.0001 // Âm lượng khi kết thúc (gần như im lặng)

        // 1. Giai đoạn Sustain với dao động ngẫu nhiên
        const sustainPoints = 10 // Số điểm ngẫu nhiên trong giai đoạn Sustain
        const randomAmplitude = 0.05 // Biên độ dao động ngẫu nhiên (ví dụ: 0.6 +/- 0.05)
        const randomValues = new Float32Array(sustainPoints)

        for (let i = 0; i < sustainPoints; i++) {
            const randomFactor = (Math.random() - 0.5) * 2 // Tạo số ngẫu nhiên từ -1 đến 1
            randomValues[i] = initialVolume + (randomFactor * randomAmplitude)
        }
        // Đảm bảo điểm cuối của giai đoạn Sustain là initialVolume để chuyển sang Decay mượt mà
        randomValues[sustainPoints - 1] = initialVolume

        // Áp dụng đường cong ngẫu nhiên này vào gainParam
        gainParam.setValueCurveAtTime(randomValues, timeToPlay, sustainDuration)

        // 2. Giai đoạn Decay
        // Lên lịch cho việc giảm âm lượng bắt đầu ngay sau khi giai đoạn Sustain kết thúc
        gainParam.exponentialRampToValueAtTime(endVolume, decayEndTime)

        // --- Cấu hình và kết nối các node ---
        osc.type = config.BEAT_OSCILLATOR_TYPE
        const frequency = noteToFreq(config.BEAT_NOTE)
        osc.frequency.setValueAtTime(frequency, timeToPlay)

        osc.connect(gain)
        gain.connect(audioContextInstance.destination)

        // Bắt đầu và dừng Oscillator theo đúng tổng thời gian của đường bao âm lượng
        osc.start(timeToPlay)
        osc.stop(decayEndTime) // Dừng oscillator tại thời điểm kết thúc Decay
    } catch (e) {
        console.error('Lỗi trong playClickSound:', e)
    }
}