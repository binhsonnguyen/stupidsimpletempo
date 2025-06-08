import { Metronome } from './metronome.js'

// describe: Nhóm các test case cho cùng một đối tượng/module
describe('Metronome Entity', () => {
    // test (hoặc it): Một kịch bản test cụ thể
    test('phải khởi tạo đúng BPM ban đầu và trạng thái isRunning', () => {
        const metronome = new Metronome({ initialBpm: 120, minBpm: 40, maxBpm: 200 })

        // expect: Công cụ để kiểm tra (khẳng định) một giá trị có đúng như mong đợi không
        expect(metronome.bpm).toBe(120)
        expect(metronome.isRunning).toBe(false)
    })

    test('phải bật và tắt đúng cách với hàm toggle', () => {
        const metronome = new Metronome({ initialBpm: 100, minBpm: 40, maxBpm: 200 })

        metronome.toggle()
        expect(metronome.isRunning).toBe(true)

        metronome.toggle()
        expect(metronome.isRunning).toBe(false)
    })

    test('phải giới hạn BPM trong khoảng min/max khi đặt giá trị quá cao', () => {
        const metronome = new Metronome({ initialBpm: 100, minBpm: 40, maxBpm: 200 })

        metronome.setBpm(300)
        expect(metronome.bpm).toBe(200)
    })

    test('phải giới hạn BPM trong khoảng min/max khi đặt giá trị quá thấp', () => {
        const metronome = new Metronome({ initialBpm: 100, minBpm: 40, maxBpm: 200 })

        metronome.setBpm(20)
        expect(metronome.bpm).toBe(40)
    })
})