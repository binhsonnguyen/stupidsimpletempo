/**
 * Chuyển đổi một tên nốt nhạc (ví dụ: 'A4') thành tần số tương ứng (Hz).
 * Đây là một hàm tính toán thuần túy, không có phụ thuộc vào bên ngoài.
 * @param {string} note - Tên nốt nhạc.
 * @returns {number} - Tần số Hz.
 */
export function noteToFreq (note: string) {
    const noteMap = {C: -9,D: -7,E: -5,F: -4,G: -2,A: 0,B: 2 }
    const referenceOctave = 4
    const referenceFreq = 440

    const match = note.match(/^([A-G])([#b]*)(\d+)$/i)
    if (!match) {
        return referenceFreq
    }

    const noteName = match[1].toUpperCase()
    const accidentals = match[2]
    const octave = parseInt(match[3], 10)

    let semitoneOffset = noteMap[noteName]
    if (semitoneOffset == null) {
        return referenceFreq
    }

    for (const accidental of accidentals) {
        if (accidental === '#') {
            semitoneOffset++
        } else if (accidental === 'b') {
            semitoneOffset--
        }
    }

    const semitonesFromA4 = semitoneOffset + (octave - referenceOctave) * 12
    return referenceFreq * Math.pow(2, semitonesFromA4 / 12)
}