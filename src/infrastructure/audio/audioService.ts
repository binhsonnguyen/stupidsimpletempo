// /src/infrastructure/audio/audioService.ts
import * as config from '../config'; // Giả sử config.ts export các hằng số với kiểu
import { soundFactory, SoundFactoryInterface } from './soundFactory'; // Import SoundFactoryInterface
import { logger } from "../logger"; // Giả sử logger có kiểu
import * as Tone from "tone";
import {Beat, BeatType} from "@/core/domain/beat";

let audioContextInstance: AudioContext | null = null;
let schedulerTimerId: NodeJS.Timeout | null = null;
let nextNoteTimestamp: number = 0.0;

// === Các biến trạng thái cho scheduler ===
let currentBeat: Beat | null = null;
let isRunningCallback: () => boolean = () => false;
let getBpmCallback: () => number = () => config.MIN_SCALE_BPM; // Giả sử MIN_SCALE_BPM là number

// === "Bộ phiên dịch" từ Beat Type sang thuộc tính âm thanh, đọc từ config ===
interface BeatSoundProps {
    note: string; // Giả sử ACCENT_BEAT_NOTE, REGULAR_BEAT_NOTE là string
    gain: number; // Giả sử ACCENT_BEAT_GAIN, REGULAR_BEAT_GAIN là number
}

const BEAT_SOUND_MAP: Record<BeatType, BeatSoundProps> = {
    accent: { note: config.ACCENT_BEAT_NOTE, gain: config.ACCENT_BEAT_GAIN },
    regular: { note: config.REGULAR_BEAT_NOTE, gain: config.REGULAR_BEAT_GAIN }
};

interface PlayAccentSoundParams {
    gain?: number;
    when?: number;
}

export function playAccentSound({
                                    gain = 1.0,
                                    when
                                }: PlayAccentSoundParams): boolean {
    if (!audioContextInstance || audioContextInstance.state !== 'running') {
        logger.warn('playAccentSound: AudioContext không sẵn sàng.'); // Sửa tên hàm trong log
        return false;
    }

    const soundLib = soundFactory.getSoundLib(); // soundLib sẽ có kiểu WoodblockSoundLibrary

    if (soundLib) { // Kiểm tra trực tiếp soundLib thay vì !!soundLib
        const playTime: number = when !== undefined ? when : audioContextInstance.currentTime;
        soundLib.play(playTime, gain);
        logger.log(`playAccentSound: Lên lịch phát âm thanh tại ${playTime} với gain ${gain}`);
        return true;
    } else {
        logger.error(`playAccentSound: Không thể lấy thư viện âm thanh`); // Sửa thông báo lỗi
        return false;
    }
}

// === Bộ định thời đã được nâng cấp để diễn giải Beat Type ===
function audioScheduler(): void {
    if (!isRunningCallback()) {
        stop();
        return;
    }

    if (!audioContextInstance) { // Thêm kiểm tra audioContextInstance
        logger.error('audioScheduler: AudioContext chưa được khởi tạo. Đang dừng...');
        stop();
        return;
    }

    while (nextNoteTimestamp < audioContextInstance.currentTime + config.AUDIO_SCHEDULE_LOOKAHEAD_SECONDS) {
        if (!currentBeat) {
            logger.error('Scheduler chạy mà không có beat nào, đang dừng...');
            stop();
            return;
        }

        // 1. "Diễn giải" loại beat thành các thuộc tính âm thanh cụ thể
        const soundProps: BeatSoundProps = BEAT_SOUND_MAP[currentBeat.type] || BEAT_SOUND_MAP.regular;

        // 2. Sử dụng playAccentSound để lên lịch phát âm thanh
        playAccentSound({
            gain: soundProps.gain,
            when: nextNoteTimestamp
        });

        // 3. Tính toán và di chuyển đến beat tiếp theo
        const bpm: number = getBpmCallback();
        if (bpm === undefined || bpm <= 0) {
            logger.warn(`audioScheduler: BPM không hợp lệ (${bpm}), dừng scheduler.`);
            stop();
            return;
        }
        const secondsPerBeat: number = (60.0 / bpm) * currentBeat.durationFactor;
        nextNoteTimestamp += secondsPerBeat;
        currentBeat = currentBeat.nextBeat;
    }

    schedulerTimerId = setTimeout(audioScheduler, config.SCHEDULER_RUN_INTERVAL_MS);
}

export function init(): Promise<void> {
    return new Promise<void>((resolve, reject) => { // Thêm kiểu generic cho Promise
        if (!audioContextInstance) {
            try {
                // Đảm bảo window.webkitAudioContext được xử lý đúng kiểu nếu có
                const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContextConstructor) {
                    logger.error('AudioContext không được hỗ trợ bởi trình duyệt này.');
                    return reject(new Error('AudioContext not supported')); // reject với Error
                }
                audioContextInstance = new AudioContextConstructor();

                if (!audioContextInstance) { // Kiểm tra lại sau khi khởi tạo
                    logger.error('initializeAudioContext thất bại, không rõ lý do.');
                    // return false; // Trong Promise, nên reject thay vì return false
                    return reject(new Error('Failed to initialize AudioContext'));
                }

                logger.log('initializeAudioContext', audioContextInstance.state);

                soundFactory.init({ audioContext: audioContextInstance });

                audioContextInstance.onstatechange = () => {
                    if (audioContextInstance) { // Kiểm tra null cho audioContextInstance
                        logger.log('Trạng thái AudioContext đã thay đổi thành:', audioContextInstance.state);
                    }
                };

                Tone.setContext(audioContextInstance);
                resolve(); // Resolve khi thành công
            } catch (e: any) { // Thêm kiểu cho e
                logger.error('Lỗi khi tạo AudioContext:', e);
                reject(e); // reject với lỗi
            }
        } else {
            resolve(); // Resolve nếu đã được khởi tạo
        }
    });
}

interface PlaySequenceParams {
    getBpm: () => number;
    isRunning: () => boolean;
    beatSequence: Beat; // Sử dụng kiểu Beat đã định nghĩa
}

export function playSequence({ getBpm, isRunning, beatSequence }: PlaySequenceParams): boolean {
    if (!audioContextInstance || audioContextInstance.state !== 'running' || !beatSequence) {
        return false;
    }
    isRunningCallback = isRunning;
    getBpmCallback = getBpm;
    currentBeat = beatSequence;
    // Đảm bảo audioContextInstance không null trước khi truy cập currentTime
    nextNoteTimestamp = audioContextInstance.currentTime + 0.1;

    audioScheduler();
    return true;
}

export function stop(): void {
    if (schedulerTimerId) { // Chỉ clearTimeout nếu schedulerTimerId có giá trị
        clearTimeout(schedulerTimerId);
        schedulerTimerId = null;
    }
}