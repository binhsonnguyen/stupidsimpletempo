import { Beat } from './beat.js'

describe('Beat Entity', () => {
    test('phải khởi tạo đúng với các thuộc tính được cung cấp', () => {
        const beat = new Beat({ note: 'A6', gain: 0.8, durationFactor: 1.5 })

        expect(beat.note).toBe('A6')
        expect(beat.gain).toBe(0.8)
        expect(beat.durationFactor).toBe(1.5)
        expect(beat.nextBeat).toBeNull()
    })

    test('phải sử dụng giá trị mặc định cho gain và durationFactor nếu không được cung cấp', () => {
        const beat = new Beat({ note: 'C5' })

        expect(beat.gain).toBe(1.0)
        expect(beat.durationFactor).toBe(1.0)
    })

    test('phương thức setNext phải gán đúng beat tiếp theo', () => {
        const beat1 = new Beat({ note: 'A' })
        const beat2 = new Beat({ note: 'B' })

        beat1.setNext(beat2)

        expect(beat1.nextBeat).toBe(beat2)
    })

    test('phương thức setNext phải trả về beat tiếp theo để cho phép nối chuỗi (fluent)', () => {
        const beat1 = new Beat({ note: 'A' })
        const beat2 = new Beat({ note: 'B' })
        const beat3 = new Beat({ note: 'C' })

        beat1.setNext(beat2).setNext(beat3)

        expect(beat1.nextBeat).toBe(beat2)
        expect(beat2.nextBeat).toBe(beat3)
    })

    test('có thể tự trỏ đến chính nó để tạo vòng lặp 1-node', () => {
        const beat = new Beat({ note: 'A' })

        beat.setNext(beat)

        expect(beat.nextBeat).toBe(beat)
    })
})