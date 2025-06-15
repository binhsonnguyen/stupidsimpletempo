// Thêm createBeatSequence vào danh sách các phụ thuộc được tiêm vào
export function createUseCases ({ metronome, audioService, wakeLockService, config, createBeatSequence }) {
    /**
     * Bật hoặc tắt máy đếm nhịp.
     */
    function toggleMetronome () {
        metronome.toggle()

        if (metronome.isRunning) {
            const getBpm = () => metronome.bpm
            const isRunning = () => metronome.isRunning

            // 1. Dùng "nhà máy" để tạo ra chuỗi nhịp cơ bản
            const beatSequence = createBeatSequence('basic')

            // 2. Cung cấp chuỗi nhịp này cho audioService
            audioService.playSequence({
                getBpm,
                isRunning,
                beatSequence
            })

            wakeLockService.request()
        } else {
            audioService.stop()
            wakeLockService.release()
        }
    }

    function changeBpm (bpm) {
        metronome.bpm = bpm
    }

    // Trả về một đối tượng chứa các use case đã được "tiêm" phụ thuộc
    return {
        toggleMetronome,
        changeBpm
    }
}