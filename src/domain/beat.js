export class Beat {
    /**
     * Khởi tạo một đối tượng Beat.
     * @param {object} params - Các thuộc tính của beat.
     * @param {string} params.note - Nốt nhạc của beat (ví dụ: 'A6').
     * @param {number} [params.gain=1.0] - Cường độ của beat.
     * @param {number} [params.durationFactor=1.0] - Hệ số trường độ.
     */
    constructor ({ note, gain = 1.0, durationFactor = 1.0 }) {
        this.note = note
        this.gain = gain
        this.durationFactor = durationFactor
        this.nextBeat = null
    }

    /**
     * Thiết lập beat tiếp theo trong chuỗi và trả về beat đó.
     * @param {Beat} beat - Đối tượng beat tiếp theo.
     * @returns {Beat} - Trả về chính đối tượng beat được truyền vào để cho phép nối chuỗi.
     */
    setNext (beat) {
        this.nextBeat = beat
        return beat
    }
}