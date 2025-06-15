import { noteToFreq } from './audioUtils.js'

describe('Audio Utilities', () => {
    describe('noteToFreq', () => {
        // Sử dụng toBeCloseTo cho các so sánh số thực để tránh lỗi làm tròn
        test('phải chuyển đổi nốt A4 (nốt chuẩn) thành 440 Hz', () => {
            expect(noteToFreq('A4')).toBeCloseTo(440.0)
        })

        test('phải chuyển đổi nốt C5 thành tần số đúng (~523.25 Hz)', () => {
            expect(noteToFreq('C5')).toBeCloseTo(523.25)
        })

        test('phải xử lý nốt thăng (#) đúng cách', () => {
            // A#4 cao hơn A4 một nửa cung
            expect(noteToFreq('A#4')).toBeCloseTo(466.16)
        })

        test('phải xử lý nốt giáng (b) đúng cách', () => {
            // Bb4 tương đương A#4
            expect(noteToFreq('Bb4')).toBeCloseTo(466.16)
        })

        test('phải trả về tần số tham chiếu nếu tên nốt không hợp lệ', () => {
            expect(noteToFreq('InvalidNote')).toBe(440)
            expect(noteToFreq('H7')).toBe(440)
        })
    })
})