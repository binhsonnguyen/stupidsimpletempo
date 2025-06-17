import { noteToFreq } from '../../core/domain/audioUtils.js'
import * as Tone from 'tone';

// Các hằng số định nghĩa đặc tính của envelope âm thanh
const SOUND_DURATION = 0.05;
const ATTACK_DURATION = SOUND_DURATION / 3;
const DECAY_DURATION = SOUND_DURATION - ATTACK_DURATION;
const RELEASE_DURATION = 0.001;

export class Sound {
    /**
     * Khởi tạo một đối tượng âm thanh có thể tái sử dụng.
     * @param {object} options - Các tùy chọn cho âm thanh.
     * @param {string} options.note - Nốt nhạc của âm thanh.
     * @param {string} options.oscillatorType - Dạng sóng (ví dụ: 'sine', 'square', 'sawtooth', 'triangle', 'fatsawtooth', 'fatsquare', 'fattriangle').
     */
    constructor ({ note, oscillatorType }) {
        this.note = note;
        // Mặc định sử dụng 'fatsawtooth' nếu không có oscillatorType cụ thể nào được truyền vào
        // Hoặc bạn có thể yêu cầu người dùng luôn truyền một loại "fat"
        this.oscillatorType = oscillatorType.startsWith('fat') ? oscillatorType : `fat${oscillatorType}`;
        this.frequency = noteToFreq(this.note);

        // Tạo hiệu ứng Chorus
        this.chorus = new Tone.Chorus({
            frequency: 1.5, // Tần số của LFO điều khiển chorus
            delayTime: 2.5, // Thời gian trễ giữa các giọng chorus (ms)
            depth: 0.5,     // Độ sâu của hiệu ứng chorus (0-1)
            feedback: 0.1,  // Lượng tín hiệu được phản hồi lại (0-1)
            spread: 180     // Độ rộng stereo của chorus (độ)
        }).toDestination(); // Kết nối chorus tới đầu ra chính

        this.synth = new Tone.Synth({
            oscillator: {
                // Sử dụng oscillatorType đã được cập nhật (có thể là fat oscillator)
                type: this.oscillatorType,
                // Bạn có thể thêm các tùy chọn cho FatOscillator ở đây nếu muốn tinh chỉnh thêm
                // ví dụ: count: 3, spread: 20 (số lượng oscillators con và độ lệch tần số)
            },
            envelope: {
                attack: ATTACK_DURATION,
                decay: DECAY_DURATION,
                sustain: 0,
                release: RELEASE_DURATION,
            },
        }).connect(this.chorus); // Kết nối synth tới chorus thay vì trực tiếp toDestination()
    }

    /**
     * Chơi âm thanh tại một thời điểm với một cường độ nhất định sử dụng Tone.js.
     * @param {number} time - Thời điểm để chơi (giây, theo Tone.now() hoặc thời gian tuyệt đối).
     * @param {number} gain - Cường độ (âm lượng tuyến tính, 0-1) của âm thanh.
     */
    play (time, gain) {
        try {
            const velocity = Math.max(0.00001, gain);
            this.synth.triggerAttackRelease(
                this.frequency,
                SOUND_DURATION,
                time,
                velocity
            );
        } catch (e) {
            console.error(`Lỗi khi chơi âm thanh cho nốt ${this.note} với Tone.Synth:`, e);
        }
    }

    // Thêm một phương thức để dọn dẹp khi không cần thiết nữa (ví dụ khi component bị unmount)
    dispose() {
        if (this.synth && !this.synth.disposed) {
            this.synth.dispose();
        }
        if (this.chorus && !this.chorus.disposed) {
            this.chorus.dispose();
        }
    }
}