// /src/core/domain/beatSequenceFactory.ts
import { Beat, BeatType } from './beat'; // Giả sử BeatType được export từ beat.ts

// Định nghĩa các giá trị signature hợp lệ
export type BeatSignature = '4/4' | '3/4' | 'basic';

/**
 * Tạo một chuỗi beat (danh sách liên kết vòng) dựa trên một mẫu nhịp.
 * @param {BeatSignature} signature - Tên của mẫu nhịp (vd: 'basic', '4/4', '3/4'). Mặc định là 'basic'.
 * @returns {Beat} - Node đầu tiên của chuỗi beat.
 */
export function createBeatSequence(signature: BeatSignature = 'basic'): Beat {
    switch (signature) {
        case '4/4': {
            const beat1 = new Beat({ type: BeatType.Accent });
            const beat2 = new Beat({ type: BeatType.Regular });
            const beat3 = new Beat({ type: BeatType.Regular });
            const beat4 = new Beat({ type: BeatType.Regular });

            beat1.setNext(beat2).setNext(beat3).setNext(beat4).setNext(beat1);
            return beat1;
        }

        case '3/4': {
            const beat1 = new Beat({ type: BeatType.Accent });
            const beat2 = new Beat({ type: BeatType.Regular });
            const beat3 = new Beat({ type: BeatType.Regular });

            beat1.setNext(beat2).setNext(beat3).setNext(beat1);
            return beat1;
        }

        case 'basic':
        default: {
            // Phách cơ bản là một phách mạnh lặp lại
            const beat = new Beat({ type: BeatType.Accent });
            // Giả sử Beat có thuộc tính nextBeat hoặc phương thức setNext
            // Nếu Beat có phương thức setNext, nên dùng: beat.setNext(beat);
            beat.nextBeat = beat;
            return beat;
        }
    }
}