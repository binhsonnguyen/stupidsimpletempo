export class Beat {
    /**
     * Khởi tạo một đối tượng Beat.
     * @param {object} [options={}] - Các thuộc tính của beat.
     * @param {string} [options.type='regular'] - Kiểu của beat ('accent' hoặc 'regular').
     * @param {number} [options.durationFactor=1.0] - Hệ số trường độ.
     */
    constructor ({ type = 'regular', durationFactor = 1.0 } = {}) {
        this.type = type
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