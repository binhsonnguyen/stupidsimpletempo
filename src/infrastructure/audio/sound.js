import { noteToFreq } from '../../domain/audioUtils.js'

export class Sound {
    /**
     * Khởi tạo một đối tượng âm thanh có thể tái sử dụng.
     * @param {AudioContext} audioContext - Đối tượng AudioContext toàn cục.
     * @param {object} options - Các tùy chọn cho âm thanh.
     * @param {string} options.note - Nốt nhạc của âm thanh.
     * @param {string} options.oscillatorType - Dạng sóng (sine, triangle, etc.).
     */
    constructor (audioContext, { note, oscillatorType }) {
        if (!audioContext) {
            throw new Error('Sound class requires an audioContext.')
        }
        this.audioContext = audioContext
        this.note = note
        this.oscillatorType = oscillatorType
        this.frequency = noteToFreq(this.note) // Tính toán và lưu lại tần số một lần duy nhất
    }

    /**
     * Chơi âm thanh tại một thời điểm với một cường độ nhất định.
     * @param {number} time - Thời điểm để chơi (giây, theo audioContext.currentTime).
     * @param {number} gain - Cường độ (âm lượng) của âm thanh.
     */
    play (time, gain) {
        if (this.audioContext.state !== 'running') return

        try {
            // Các AudioNode như OscillatorNode và GainNode chỉ dùng được một lần
            // nên chúng ta tạo mới chúng mỗi khi gọi play().
            const osc = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()
            const gainParam = gainNode.gain
            const soundDuration = 0.05
            const decayEndTime = time + soundDuration
            const endVolume = 0.0001

            // Sử dụng lại logic envelope "độc đáo" của chúng ta
            const sustainPoints = 10
            const randomAmplitude = 0.05
            const randomValues = new Float32Array(sustainPoints)
            for (let i = 0; i < sustainPoints; i++) {
                const randomFactor = (Math.random() - 0.5) * 2
                randomValues[i] = gain + (randomFactor * randomAmplitude)
            }
            randomValues[sustainPoints - 1] = gain

            gainParam.setValueCurveAtTime(randomValues, time, soundDuration / 3)
            gainParam.exponentialRampToValueAtTime(endVolume, decayEndTime)

            // Sử dụng các thuộc tính đã được cấu hình sẵn của đối tượng
            osc.type = this.oscillatorType
            osc.frequency.setValueAtTime(this.frequency, time)

            osc.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            osc.start(time)
            osc.stop(decayEndTime)
        } catch (e) {
            console.error(`Lỗi khi chơi âm thanh cho nốt ${this.note}:`, e)
        }
    }
}