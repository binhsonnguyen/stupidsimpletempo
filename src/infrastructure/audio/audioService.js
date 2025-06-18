import * as config from '../config.js'
import {soundFactory} from './soundFactory.ts'
import {logger} from "../logger";
import * as Tone from "tone";

let audioContextInstance = null
let schedulerTimerId = null
let nextNoteTimestamp = 0.0

// === Các biến trạng thái cho scheduler ===
let currentBeat = null
let isRunningCallback = () => false
let getBpmCallback = () => config.MIN_SCALE_BPM

// === "Bộ phiên dịch" từ Beat Type sang thuộc tính âm thanh, đọc từ config ===
const BEAT_SOUND_MAP = {
    accent: {note: config.ACCENT_BEAT_NOTE, gain: config.ACCENT_BEAT_GAIN},
    regular: {note: config.REGULAR_BEAT_NOTE, gain: config.REGULAR_BEAT_GAIN}
}

export function playAccentSound({
                                    gain = 1.0,
                                    when
                                }) {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        logger.warn('playSingleSound: AudioContext không sẵn sàng.');
        return false;
    }

    const soundLib = soundFactory.getSoundLib();

    if (!!soundLib) {
        const playTime = when !== undefined ? when : audioContextInstance.currentTime;
        soundLib.play(playTime, gain);
        logger.log(`playAccentSound: Lên lịch phát âm thanh tại ${playTime} với gain ${gain}`);
        return true;
    } else {
        logger.error(`playAccentSound: Không thể lấy hoặc tạo thư viện âm thanh`);
        return false;
    }
}

// === Bộ định thời đã được nâng cấp để diễn giải Beat Type ===
function audioScheduler() {
    if (!isRunningCallback()) {
        stop()
        return
    }

    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS) {
        if (!currentBeat) {
            logger.error('Scheduler chạy mà không có beat nào, đang dừng...')
            stop()
            return
        }

        // 1. "Diễn giải" loại beat thành các thuộc tính âm thanh cụ thể
        const soundProps = BEAT_SOUND_MAP[currentBeat.type] || BEAT_SOUND_MAP.regular

        // 2. Sử dụng playSingleSound để lên lịch phát âm thanh
        playAccentSound({
            gain: soundProps.gain,
            when: nextNoteTimestamp
        })

        // 3. Tính toán và di chuyển đến beat tiếp theo
        const bpm = getBpmCallback()
        if (bpm === undefined || bpm <= 0) { // Thêm kiểm tra bpm hợp lệ
            logger.warn(`audioScheduler: BPM không hợp lệ (${bpm}), dừng scheduler.`);
            stop();
            return;
        }
        const secondsPerBeat = (60.0 / bpm) * currentBeat.durationFactor
        nextNoteTimestamp += secondsPerBeat
        currentBeat = currentBeat.nextBeat
    }

    schedulerTimerId = setTimeout(audioScheduler, config.SCHEDULER_RUN_INTERVAL_MS)
}

export function init() {
    return new Promise((resolve, reject) => {
        if (!audioContextInstance) {
            try {
                audioContextInstance = new (window.AudioContext || window.webkitAudioContext)()
                if (!audioContextInstance) {
                    logger.log('initializeAudioContext failed, unknowed why')
                    return false
                }

                logger.log('initializeAudioContext', audioContextInstance.state)

                soundFactory.init({audioContext: audioContextInstance})

                audioContextInstance.onstatechange = () => {
                    logger.log('Trạng thái AudioContext đã thay đổi thành:', audioContextInstance.state)
                }

                // lệnh duy nhất cần giữ lại
                Tone.setContext(audioContextInstance)
            } catch (e) {
                logger.error('Lỗi khi tạo AudioContext:', e)
                reject()
            }
        }
        resolve()
    })
}

export function playSequence({getBpm, isRunning, beatSequence}) {
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

export function stop() {
    clearTimeout(schedulerTimerId)
    schedulerTimerId = null
}