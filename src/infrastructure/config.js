export const SCHEDULER_RUN_INTERVAL_MS = 25.0
export const AUDIO_SCHEDULE_LOOKAHEAD_SECONDS = 0.1

// hard code từ svg ra, dùng trong usecase (mã xấu)
export const ANGLE_FOR_0_BPM_MARK = 0
export const ANGLE_FOR_MIN_SCALE_BPM_MARK = 12
export const ANGLE_FOR_MAX_SCALE_BPM_MARK = 320
export const MIN_SCALE_BPM = 40
export const MAX_SCALE_BPM = 200

// --- Cấu hình Âm thanh & Phách ---

// "Code hóa" các loại oscillator và mô tả của chúng
export const OSCILLATOR_CONFIGS = {
    SINE: {
        value: 'sine',
        description: 'Giống tiếng sáo (flute like)'
    },
    TRIANGLE: {
        value: 'triangle',
        description: 'Giống tiếng sáo nhưng có chút "bụi" (flute but more "dusty")'
    },
    SQUARE: {
        value: 'square',
        description: 'Giống âm thanh game 8-bit (8-bit game like)'
    },
    SAWTOOTH: {
        value: 'sawtooth',
        description: 'Sắc, nhẹ, giống tiếng synth (sharp, light, synth like)'
    }
}

export const BEAT_OSCILLATOR_TYPE = OSCILLATOR_CONFIGS.TRIANGLE

export const ACCENT_BEAT_NOTE = 'A6'
export const ACCENT_BEAT_GAIN = 1.0
export const REGULAR_BEAT_NOTE = 'C6'
export const REGULAR_BEAT_GAIN = 0.6