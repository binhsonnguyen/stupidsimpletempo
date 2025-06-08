import { createBeatSequence } from './beatSequenceFactory.js'
import { Beat } from './beat.js'

describe('Beat Sequence Factory (Refactored)', () => {
    test("phải tạo ra một chuỗi 'basic' với một node duy nhất có type 'accent'", () => {
        const sequenceHead = createBeatSequence('basic')

        expect(sequenceHead).toBeInstanceOf(Beat)
        expect(sequenceHead.nextBeat).toBe(sequenceHead)
        expect(sequenceHead.type).toBe('accent')
    })

    test("phải tạo ra một chuỗi '4/4' đúng (accent, regular, regular, regular)", () => {
        const beat1 = createBeatSequence('4/4')
        const beat2 = beat1.nextBeat
        const beat3 = beat2.nextBeat
        const beat4 = beat3.nextBeat

        expect(beat1.type).toBe('accent')
        expect(beat2.type).toBe('regular')
        expect(beat3.type).toBe('regular')
        expect(beat4.type).toBe('regular')

        // Kiểm tra tính vòng lặp
        expect(beat4.nextBeat).toBe(beat1)
    })

    test("phải tạo ra một chuỗi '3/4' đúng (accent, regular, regular)", () => {
        const beat1 = createBeatSequence('3/4')
        const beat2 = beat1.nextBeat
        const beat3 = beat2.nextBeat

        expect(beat1.type).toBe('accent')
        expect(beat2.type).toBe('regular')
        expect(beat3.type).toBe('regular')

        // Kiểm tra tính vòng lặp
        expect(beat3.nextBeat).toBe(beat1)
    })
})