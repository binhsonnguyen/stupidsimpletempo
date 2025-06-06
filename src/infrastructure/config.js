export const SCHEDULER_RUN_INTERVAL_MS = 25.0
export const AUDIO_SCHEDULE_LOOKAHEAD_SECONDS = 0.1
export const SENSITIVITY_FACTOR = 3
export const TICK_INITIAL_TOP_OFFSET = 5
export const TICK_LARGE_WIDTH = 1.5
export const TICK_LARGE_HEIGHT = 10
export const TICK_SMALL_WIDTH = 1
export const TICK_SMALL_HEIGHT = 6

export const MIN_SCALE_BPM = 40 // BPM nhỏ nhất trên thang đo chính của dial
export const MAX_SCALE_BPM = 200 // BPM lớn nhất trên thang đo chính của dial

export const ANGLE_FOR_0_BPM_MARK = 0     // Vạch "0" tượng trưng luôn ở 12 giờ (0 độ)
export const BPM_VALUE_FOR_0_DEG_MARK = 0  // Giá trị BPM tượng trưng cho nhãn "0"
export const ANGLE_FOR_MIN_SCALE_BPM_MARK = 12   // Ví dụ: 48 độ từ vạch "0"
export const ANGLE_FOR_MAX_SCALE_BPM_MARK = 320 // Ví dụ: 240 độ từ vạch "0"

export const INITIAL_AUDIO_GAIN = 1 // Âm lượng ban đầu (từ 0.0 đến 1.0)
export const BEAT_NOTE = "A6"

// 'sine': flute like
// 'triangle': flute but more "dusty"
// 'square': 8-bit game like
// 'sawtooth': sharp, light, synth like
export const BEAT_OSCILLATOR_TYPE = "triangle"
