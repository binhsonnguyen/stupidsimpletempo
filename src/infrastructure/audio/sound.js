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
            const curveDuration = soundDuration / 3;
            const decayEndTime = time + soundDuration;

            // Âm lượng cuối cùng rất nhỏ (gần như im lặng)
            const endVolumeLinear = 0.0001;

            // Logic envelope "độc đáo"
            const sustainPoints = 10;
            const randomAmplitude = 0.05; // Biên độ ngẫu nhiên cho envelope

            const randomLinearValues = new Float32Array(sustainPoints);
            for (let i = 0; i < sustainPoints; i++) {
                const randomFactor = (Math.random() - 0.5) * 2; // Từ -1 đến 1
                let currentLinearGain = gain + (randomFactor * randomAmplitude);
                randomLinearValues[i] = Math.max(0.00001, currentLinearGain); // Đảm bảo giá trị dương cho việc chuyển đổi sang dB
            }
            // Đảm bảo điểm cuối của phần curve là giá trị 'gain' (đã được làm sạch)
            randomLinearValues[sustainPoints - 1] = Math.max(0.00001, gain);

            // Chuyển đổi giá trị âm lượng tuyến tính sang Decibels cho Tone.js
            const randomValuesDb = new Float32Array(sustainPoints);
            for (let i = 0; i < sustainPoints; i++) {
                randomValuesDb[i] = Tone.gainToDb(randomLinearValues[i]);
            }
            const endVolumeDb = Tone.gainToDb(endVolumeLinear);

            // Áp dụng envelope cho volume của oscillator
            // Phần curve ngẫu nhiên
            osc.volume.setValueCurveAtTime(randomValuesDb, time, curveDuration);

            // Phần decay xuống âm lượng cuối cùng
            // exponentialRampToValueAtTime bắt đầu từ giá trị cuối cùng của sự kiện trước đó
            // tại thời điểm kết thúc của sự kiện đó (time + curveDuration)
            osc.volume.exponentialRampToValueAtTime(endVolumeDb, decayEndTime);

            // Bắt đầu và dừng oscillator
            osc.start(time);
            osc.stop(decayEndTime);

            // Dọn dẹp oscillator sau khi nó đã phát xong để giải phóng tài nguyên
            // Sử dụng `Tone.Transport` nếu bạn muốn đồng bộ hóa với transport,
            // ở đây giả định `time` là thời gian tuyệt đối hoặc tương đối với `Tone.now()`
            // và không cần `osc.sync()`
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