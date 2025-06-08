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
            audioService.start({
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

    /**
     * Thay đổi BPM dựa vào góc xoay của dial.
     * @param {number} angleOnDial - Góc xoay hiện tại.
     */
    function changeBpmFromAngle (angleOnDial) {
        let newBpmCandidate
        const roundedAngle = Math.round(angleOnDial)

        const {
            ANGLE_FOR_0_BPM_MARK,
            ANGLE_FOR_MIN_SCALE_BPM_MARK,
            ANGLE_FOR_MAX_SCALE_BPM_MARK,
            MIN_SCALE_BPM,
            MAX_SCALE_BPM
        } = config

        if (roundedAngle === ANGLE_FOR_0_BPM_MARK || (roundedAngle === 360 && ANGLE_FOR_0_BPM_MARK === 0)) {
            return
        }

        if (angleOnDial > ANGLE_FOR_0_BPM_MARK && angleOnDial < ANGLE_FOR_MIN_SCALE_BPM_MARK) {
            newBpmCandidate = MIN_SCALE_BPM
        } else if (angleOnDial >= ANGLE_FOR_MIN_SCALE_BPM_MARK && angleOnDial <= ANGLE_FOR_MAX_SCALE_BPM_MARK) {
            const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM
            const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK

            if (angleScaleRange <= 0 || bpmScaleRange < 0) {
                newBpmCandidate = MIN_SCALE_BPM
            } else {
                const percentageInAngleRange = (angleOnDial - ANGLE_FOR_MIN_SCALE_BPM_MARK) / angleScaleRange
                const calculatedBpm = MIN_SCALE_BPM + percentageInAngleRange * bpmScaleRange
                newBpmCandidate = Math.round(calculatedBpm)
            }
            newBpmCandidate = Math.max(MIN_SCALE_BPM, Math.min(MAX_SCALE_BPM, newBpmCandidate))
        } else {
            newBpmCandidate = MAX_SCALE_BPM
        }

        metronome.setBpm(newBpmCandidate)
    }

    // Trả về một đối tượng chứa các use case đã được "tiêm" phụ thuộc
    return {
        toggleMetronome,
        changeBpmFromAngle
    }
}