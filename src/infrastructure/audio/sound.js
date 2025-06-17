import { noteToFreq } from '../../core/domain/audioUtils.js'
import * as Tone from 'tone';

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
    }

    /**
     * Chơi âm thanh tại một thời điểm với một cường độ nhất định sử dụng Tone.js.
     * @param {number} time - Thời điểm để chơi (giây, theo Tone.now() hoặc thời gian tuyệt đối).
     * @param {number} gain - Cường độ (âm lượng tuyến tính, 0-1) của âm thanh.
     */
    play (time, gain) {
        try {
            const osc = new Tone.Oscillator({
                type: this.oscillatorType,
                frequency: this.frequency,
            }).toDestination();

            const soundDuration = 0.05;
            const attackDuration = soundDuration / 3;
            const decayEndTime = time + soundDuration;

            // Đảm bảo gain là giá trị dương hợp lệ để chuyển đổi sang dB
            const targetLinearGain = Math.max(0.00001, gain);
            const targetGainDb = Tone.gainToDb(targetLinearGain);

            // Âm lượng cuối cùng rất nhỏ (gần như im lặng)
            const endVolumeLinear = 0.0001;
            const endVolumeDb = Tone.gainToDb(endVolumeLinear);

            // Envelope đơn giản hóa: Attack -> Decay
            // 1. Bắt đầu với âm lượng rất nhỏ (coi như im lặng) tại thời điểm 'time'.
            const initialAttackVolumeDb = Tone.gainToDb(0.00001); // Âm lượng khởi đầu cho attack
            osc.volume.setValueAtTime(initialAttackVolumeDb, time);

            // 2. Attack: Tăng âm lượng tuyến tính lên targetGainDb.
            //    Quá trình này diễn ra từ 'time' đến 'time + attackDuration'.
            osc.volume.linearRampToValueAtTime(targetGainDb, time + attackDuration);

            // 3. Decay: Giảm âm lượng theo hàm mũ từ targetGainDb xuống endVolumeDb.
            //    Quá trình này diễn ra từ 'time + attackDuration' đến 'decayEndTime'.
            osc.volume.exponentialRampToValueAtTime(endVolumeDb, decayEndTime);

            // Bắt đầu và dừng oscillator
            osc.start(time);
            osc.stop(decayEndTime);

            // Dọn dẹp oscillator sau khi nó đã phát xong để giải phóng tài nguyên
            Tone.getDraw().schedule(() => {
                if (osc && !osc.disposed) {
                    osc.dispose();
                }
            }, decayEndTime + 0.1); // Dọn dẹp sau khi âm thanh kết thúc một chút

        } catch (e) {
            console.error(`Lỗi khi chơi âm thanh cho nốt ${this.note} với Tone.js:`, e);
        }
    }
}