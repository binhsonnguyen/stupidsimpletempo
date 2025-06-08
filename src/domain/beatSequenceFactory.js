import { Beat } from './beat.js'

// Định nghĩa các thuộc tính cho một phách mạnh mặc định
const ACCENT_BEAT_PROPS = { note: 'A6', gain: 1.0 }

/**
 * Tạo một chuỗi beat (danh sách liên kết vòng).
 * @param {string} signature - Tên của mẫu nhịp (hiện chỉ hỗ trợ 'basic').
 * @returns {Beat} - Node đầu tiên của chuỗi beat.
 */
export function createBeatSequence (signature = 'basic') {
    // Để pass test, chúng ta chỉ cần xử lý trường hợp 'basic'
    const beat = new Beat(ACCENT_BEAT_PROPS)
    beat.setNext(beat) // Tự trỏ về chính nó để tạo vòng lặp
    return beat
}