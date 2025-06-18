import { Beat } from './beat.ts'

/**
 * Tạo một chuỗi beat (danh sách liên kết vòng) dựa trên một mẫu nhịp.
 * @param {string} signature - Tên của mẫu nhịp (vd: 'basic', '4/4', '3/4').
 * @returns {Beat} - Node đầu tiên của chuỗi beat.
 */
export function createBeatSequence (signature = 'basic') {
    switch (signature) {
        case '4/4': {
            const beat1 = new Beat({ type: 'accent' })
            const beat2 = new Beat({ type: 'regular' })
            const beat3 = new Beat({ type: 'regular' })
            const beat4 = new Beat({ type: 'regular' })

            beat1.setNext(beat2).setNext(beat3).setNext(beat4).setNext(beat1)
            return beat1
        }

        case '3/4': {
            const beat1 = new Beat({ type: 'accent' })
            const beat2 = new Beat({ type: 'regular' })
            const beat3 = new Beat({ type: 'regular' })

            beat1.setNext(beat2).setNext(beat3).setNext(beat1)
            return beat1
        }

        case 'basic':
        default: {
            const beat = new Beat({ type: 'accent' }) // Phách cơ bản là một phách mạnh lặp lại
            beat.setNext(beat)
            return beat
        }
    }
}