import { Beat } from './beat.ts'

describe('Beat Entity (Refactored)', () => {
    test('phải khởi tạo đúng với type và durationFactor được cung cấp', () => {
        const beat = new Beat({ type: 'accent', durationFactor: 1.5 })
        expect(beat.type).toBe('accent')
        expect(beat.durationFactor).toBe(1.5)
        expect(beat.nextBeat).toBeNull()
    })

    test('phải có giá trị mặc định là type "regular" và durationFactor là 1.0', () => {
        const beat = new Beat({})
        expect(beat.type).toBe('regular')
        expect(beat.durationFactor).toBe(1.0)
    })

    // Các test cho setNext vẫn giữ nguyên vì hành vi này không đổi
    test('phương thức setNext phải gán đúng beat tiếp theo và cho phép nối chuỗi', () => {
        const beat1 = new Beat({ type: 'accent' })
        const beat2 = new Beat({ type: 'regular' })
        const beat3 = new Beat({ type: 'regular' })

        beat1.setNext(beat2).setNext(beat3)

        expect(beat1.nextBeat).toBe(beat2)
        expect(beat2.nextBeat).toBe(beat3)
    })
})