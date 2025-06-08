import { createBeatSequence } from './beatSequenceFactory.js'
import { Beat } from './beat.js'

describe('Beat Sequence Factory', () => {
    test("phải tạo ra một chuỗi 'basic' với một node duy nhất trỏ về chính nó", () => {
        // Gọi hàm factory để tạo chuỗi nhịp cơ bản
        const sequenceHead = createBeatSequence('basic')

        // Kiểm tra xem kết quả có phải là một đối tượng Beat không
        expect(sequenceHead).toBeInstanceOf(Beat)

        // Kiểm tra tính chất quan trọng nhất: nó trỏ về chính nó để tạo vòng lặp
        expect(sequenceHead.nextBeat).toBe(sequenceHead)

        // Kiểm tra xem nó có các thuộc tính cơ bản không
        expect(sequenceHead.note).toBeDefined()
        expect(sequenceHead.gain).toBe(1.0) // Giả sử phách cơ bản là phách mạnh
    })
})