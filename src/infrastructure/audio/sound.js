import { noteToFreq } from '../../core/domain/audioUtils.js'
import * as Tone from 'tone';

// Các hằng số định nghĩa đặc tính của envelope âm thanh
const SOUND_DURATION = 0.05; // Tổng thời gian mong muốn cho phần attack và decay
const ATTACK_DURATION = SOUND_DURATION / 3; // Thời gian attack
const DECAY_DURATION = SOUND_DURATION - ATTACK_DURATION; // Thời gian decay
const RELEASE_DURATION = 0.001; // Thời gian release rất ngắn để dừng âm thanh nhanh chóng

export class Sound {
    /**
     * Khởi tạo một đối tượng âm thanh có thể tái sử dụng.
     * @param {object} options - Các tùy chọn cho âm thanh.
     * @param {string} options.note - Nốt nhạc của âm thanh.
     * @param {string} options.oscillatorType - Dạng sóng (sine, triangle, etc.).
     */
    constructor ({ note, oscillatorType }) {
        this.note = note
        this.oscillatorType = oscillatorType
        this.frequency = noteToFreq(this.note) // Tính toán và lưu lại tần số một lần duy nhất

        this.synth = new Tone.Synth({
            oscillator: {
                type: this.oscillatorType,
            },
            envelope: {
                attack: ATTACK_DURATION,
                decay: DECAY_DURATION,
                sustain: 0, // Âm thanh sẽ decay xuống mức 0 (im lặng)
                release: RELEASE_DURATION, // Thời gian để âm lượng giảm từ sustain xuống 0 khi note được "nhả" ra
            },
            // volume: 0 // Âm lượng mặc định của synth, có thể điều chỉnh nếu cần
        }).toDestination(); // Kết nối synth tới đầu ra âm thanh chính
    }

    /**
     * Chơi âm thanh tại một thời điểm với một cường độ nhất định sử dụng Tone.js.
     * @param {number} time - Thời điểm để chơi (giây, theo Tone.now() hoặc thời gian tuyệt đối).
     * @param {number} gain - Cường độ (âm lượng tuyến tính, 0-1) của âm thanh.
     */
    play (time, gain) {
        try {
            // Đảm bảo gain là giá trị dương nhỏ nhất nếu nó là 0, vì velocity không nên là 0 tuyệt đối.
            const velocity = Math.max(0.00001, gain);

            // Kích hoạt synth để phát nốt nhạc
            // triggerAttackRelease(frequency, duration, time, velocity)
            // - frequency: tần số của nốt nhạc
            // - duration: khoảng thời gian nốt nhạc được "giữ" trước khi phase release bắt đầu.
            //             Ở đây, chúng ta muốn attack và decay diễn ra trong SOUND_DURATION.
            // - time: thời điểm bắt đầu phát
            // - velocity: cường độ của nốt nhạc (0-1)
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
}